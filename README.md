PolyHaven CLI

```bash
git clone ...
cd ...
docker build -t polyhaven-cli -f .devcontainer/Dockerfile.prod .
docker run -it --rm -v "${PWD}:/usr/src/app/downloads" polyhaven-cli
```