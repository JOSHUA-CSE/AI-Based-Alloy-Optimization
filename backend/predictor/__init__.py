try:
	# Initialize optional MongoDB connection when predictor package is imported
	from . import mongo  # noqa: F401
except Exception:
	pass
