.PHONY: help install lint format typecheck test check clean docker-build docker-up docker-down

PYTHON ?= python

help:
	@echo "FloodPulse Makefile commands:"
	@echo "  install    : Install dependencies in editable mode with dev dependencies"
	@echo "  lint       : Check formatting and lint rules with ruff"
	@echo "  format     : Format code with ruff"
	@echo "  typecheck  : Run static type checking with mypy"
	@echo "  test       : Run pytest suite"
	@echo "  check      : Run lint, typecheck, and tests"
	@echo "  clean      : Remove build artifacts and caches"
	@echo "  docker-up  : Spin up local services with Docker Compose"
	@echo "  docker-down: Shut down local Docker Compose services"

install:
	$(PYTHON) -m pip install -e ".[dev]"

lint:
	ruff check .
	ruff format --check .

format:
	ruff format .
	ruff check --fix .

typecheck:
	mypy src tests

test:
	pytest tests

check: lint typecheck test

clean:
	rm -rf build/ dist/ *.egg-info .pytest_cache/ .mypy_cache/ .ruff_cache/ .coverage htmlcov/

docker-up:
	docker compose up -d

docker-down:
	docker compose down
