"""OPC-UA client helpers for reading alloy composition values."""

from __future__ import annotations

import logging
import socket
import threading
from dataclasses import dataclass
from typing import Any

from django.conf import settings

from .ml.predictor import columns

try:
    from opcua import Client, ua
except ImportError:  # pragma: no cover - exercised only when dependency is absent
    Client = None
    ua = None

logger = logging.getLogger(__name__)


class OpcUaError(Exception):
    """Base exception for OPC-UA read failures."""


class OpcUaConfigurationError(OpcUaError):
    """Raised when the OPC-UA client is not configured correctly."""


class OpcUaConnectionError(OpcUaError):
    """Raised when the OPC-UA server cannot be reached."""

    def __init__(self, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(message)
        self.details = details or {}


class OpcUaReadError(OpcUaError):
    """Raised when one or more configured OPC-UA nodes cannot be read."""

    def __init__(self, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(message)
        self.details = details or {}


@dataclass(frozen=True)
class OpcUaReadResult:
    """Values and diagnostics returned from an OPC-UA read."""

    values: dict[str, float | str]
    missing_nodes: dict[str, str]
    invalid_values: dict[str, str]


class AlloyOpcUaClient:
    """Reusable OPC-UA client for alloy composition reads."""

    def __init__(self) -> None:
        self.server_url = getattr(
            settings,
            "OPCUA_SERVER_URL",
            "opc.tcp://DESKTOP-MRDSLQ0:53530/OPCUA/SimulationServer",
        )
        self.server_urls = self._build_server_urls()
        self.namespace = int(getattr(settings, "OPCUA_NAMESPACE", 3))
        self.timeout = float(getattr(settings, "OPCUA_TIMEOUT_SECONDS", 5))
        self.node_mapping = self._build_node_mapping()
        self.metadata_node_mapping = self._build_metadata_node_mapping()
        self._client: Client | None = None
        self._connected = False
        self._lock = threading.RLock()

    def _build_server_urls(self) -> list[str]:
        """Return unique OPC-UA endpoints in the order they should be tried."""
        configured_urls = getattr(settings, "OPCUA_SERVER_URLS", None) or [self.server_url]
        urls = [str(url) for url in configured_urls if str(url).strip()]

        if self.server_url not in urls:
            urls.insert(0, self.server_url)

        return list(dict.fromkeys(urls))

    def _build_node_mapping(self) -> dict[str, str]:
        """Build field-to-node mapping using the model's feature names."""
        configured_mapping = getattr(settings, "OPCUA_NODE_MAPPING", {}) or {}
        node_template = getattr(
            settings,
            "OPCUA_NODE_ID_TEMPLATE",
            "ns={namespace};s=SteelPlant.{field_upper}",
        )

        mapping: dict[str, str] = {}
        for field_name in columns:
            configured_node_id = configured_mapping.get(field_name)
            if configured_node_id is None:
                configured_node_id = configured_mapping.get(field_name.upper())

            if configured_node_id:
                mapping[field_name] = str(configured_node_id)
            else:
                mapping[field_name] = node_template.format(
                    namespace=self.namespace,
                    field=field_name,
                    field_upper=field_name.upper(),
                    field_lower=field_name.lower(),
                )

        return mapping

    def _build_metadata_node_mapping(self) -> dict[str, str]:
        """Build optional metadata node mapping."""
        configured_mapping = getattr(settings, "OPCUA_METADATA_NODE_MAPPING", {}) or {}
        return {
            field_name: str(node_id).format(
                namespace=self.namespace,
                field=field_name,
                field_upper=field_name.upper(),
                field_lower=field_name.lower(),
            )
            for field_name, node_id in configured_mapping.items()
        }

    def connect(self) -> None:
        """Connect to the OPC-UA server, reusing an active connection."""
        if Client is None:
            raise OpcUaConfigurationError(
                "OPC-UA support is not installed. Install the 'opcua' package."
            )

        with self._lock:
            if self._connected and self._client is not None:
                return

            self.disconnect()
            errors: dict[str, str] = {}

            for server_url in self.server_urls:
                logger.info("Connecting to OPC-UA server: %s", server_url)
                try:
                    self._client = Client(server_url, timeout=self.timeout)
                    self._client.connect()
                    self.server_url = server_url
                    self._connected = True
                    logger.info("Connected to OPC-UA server: %s", server_url)
                    return
                except (socket.timeout, TimeoutError) as exc:
                    errors[server_url] = f"timeout: {exc}"
                    logger.error("OPC-UA connection timeout for %s: %s", server_url, exc)
                except Exception as exc:
                    errors[server_url] = str(exc)
                    logger.error("OPC-UA connection failed for %s: %s", server_url, exc)
                finally:
                    if not self._connected:
                        try:
                            if self._client is not None:
                                self._client.disconnect()
                        except Exception:
                            pass
                        self._client = None

            self._connected = False
            self._client = None
            raise OpcUaConnectionError(
                "Unable to connect to OPC-UA server.",
                {"attempted_endpoints": errors},
            )

    def disconnect(self) -> None:
        """Disconnect from the OPC-UA server if connected."""
        with self._lock:
            if self._client is None:
                self._connected = False
                return

            try:
                self._client.disconnect()
                logger.info("Disconnected from OPC-UA server: %s", self.server_url)
            except Exception as exc:
                logger.warning("OPC-UA disconnect failed: %s", exc)
            finally:
                self._client = None
                self._connected = False

    def reconnect(self) -> None:
        """Reconnect to the OPC-UA server."""
        logger.info("Reconnecting to OPC-UA server: %s", self.server_url)
        self.disconnect()
        self.connect()

    def read_composition(self) -> OpcUaReadResult:
        """Read configured alloy composition values from OPC-UA nodes."""
        with self._lock:
            try:
                self.connect()
                return self._read_nodes()
            except OpcUaConnectionError:
                raise
            except Exception as exc:
                logger.warning("OPC-UA read failed; attempting reconnect: %s", exc)
                self.reconnect()
                return self._read_nodes()

    def _read_nodes(self) -> OpcUaReadResult:
        """Read all mapped nodes from the active connection."""
        if self._client is None:
            raise OpcUaConnectionError("OPC-UA client is not connected.")

        values: dict[str, float | str] = {}
        missing_nodes: dict[str, str] = {}
        invalid_values: dict[str, str] = {}

        for field_name, node_id in self.metadata_node_mapping.items():
            try:
                values[field_name] = self._client.get_node(node_id).get_value()
            except Exception as exc:
                logger.warning("Missing optional OPC-UA metadata node for %s: %s", field_name, node_id)
                if not self._is_missing_node_error(exc):
                    logger.debug("Optional OPC-UA metadata read error for %s: %s", field_name, exc)

        for field_name, node_id in self.node_mapping.items():
            try:
                value = self._client.get_node(node_id).get_value()
            except (socket.timeout, TimeoutError) as exc:
                self._connected = False
                logger.error("OPC-UA timeout while reading %s (%s): %s", field_name, node_id, exc)
                raise OpcUaConnectionError("OPC-UA read timed out.") from exc
            except Exception as exc:
                if self._is_missing_node_error(exc):
                    logger.warning("Missing OPC-UA node for %s: %s", field_name, node_id)
                    missing_nodes[field_name] = node_id
                    continue

                self._connected = False
                logger.error("OPC-UA connection lost while reading %s: %s", field_name, exc)
                raise OpcUaConnectionError("OPC-UA connection lost during read.") from exc

            try:
                values[field_name] = self._coerce_value(field_name, value)
            except (TypeError, ValueError) as exc:
                logger.warning("Invalid OPC-UA value for %s: %r", field_name, value)
                invalid_values[field_name] = str(exc)

        if missing_nodes or invalid_values:
            raise OpcUaReadError(
                "One or more OPC-UA nodes could not be read.",
                {
                    "missing_nodes": missing_nodes,
                    "invalid_values": invalid_values,
                    "values": values,
                },
            )

        logger.info("OPC-UA read successful for %s values", len(values))
        return OpcUaReadResult(
            values=values,
            missing_nodes=missing_nodes,
            invalid_values=invalid_values,
        )

    @staticmethod
    def _coerce_value(field_name: str, value: Any) -> float | str:
        """Convert OPC-UA values to API-ready scalar values."""
        if field_name == "heat_number":
            return str(value)

        if isinstance(value, bool):
            raise TypeError("Boolean values are not valid composition values.")

        try:
            return float(value)
        except (TypeError, ValueError) as exc:
            raise TypeError("Value must be numeric.") from exc

    @staticmethod
    def _is_missing_node_error(exc: Exception) -> bool:
        """Return True when an exception represents a missing OPC-UA node."""
        if ua is not None:
            missing_node_errors = tuple(
                error_type
                for error_type in (
                    getattr(ua.uaerrors, "BadNodeIdUnknown", None),
                    getattr(ua.uaerrors, "BadNodeIdInvalid", None),
                    getattr(ua.uaerrors, "BadAttributeIdInvalid", None),
                )
                if error_type is not None
            )
            if missing_node_errors and isinstance(exc, missing_node_errors):
                return True

        message = str(exc).lower()
        return "badnodeid" in message or "nodeid" in message and "unknown" in message


opcua_client = AlloyOpcUaClient()
