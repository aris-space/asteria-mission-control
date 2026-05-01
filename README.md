# asteria-mission-control

## Backend

### Usage

The built binary has some bundled CLI flags which can be used to configure the API before starting. Note that most flags can also be set using environment variables.

To get an overview of the available flags, run the binary with the `--help` argument.

#### Using Docker

The project contains a `Dockerfile` which builds a full stack version of the ASTERIA mission control. The backend web server is used to serve the statically built frontend.

To start the current development version of the mission control inside docker, you can simply run:

```bash
# Build new docker image and start it.
# If you also want to have a local flight computer, start with the `--profile full` 
# flag instead.
docker compose --profile mission-control up
```

after that you should be able to open the mission control UI on [http://localhost:8888](http://localhost:8888).

### Documentation

The API is documented using [OpenAPI](https://www.openapis.org/). An interactive playground of the API is available under the `/docs/ui` path and the OpenAPI schema can be found under the `/docs/openapi.json` path.

In general, all API endpoints except the ones used for documentation are prefixed with `/api/` to allow serving the static UI from the API directly using [actix-files](https://crates.io/crates/actix-files).

### Config

The backend needs a config file. The path of the config file can be specified as a CLI flag or through the `CONFIG_PATH` environment variable (see [usage](#usage)).

Besides a few other things, the config mainly contains a list of available remote computers to which the mission control can connect to. 

The config is written in TOML and follows the schema hosted by the backend on the `/api/config/schema` path.

## UI

The code for the mission control UI is located in [the ui subdirectory](./ui/)

## Diagrams

For the state machine and PSS views we use [draw.io](https://www.drawio.com) diagrams exported as SVG.
There are some things which need to be followed whilst exporting the diagram as a SVG such that the SVGs can successfully be used by the mission control:

- The SVG background needs to be set to **transparent**
- The SVG appearance needs to be set to **light**
- The "Include a copy of my diagram" option needs to be **enabled**. For multi-page diagrams, only include the current page of the diagram.
- **Don't export from a selection**, always select **document** as size (or **page** when exporting from a multi-page diagram)
- The [**svgdata** plugin](https://www.drawio.com/doc/faq/plugins) needs to be enabled, this can either be done by having the `?p=svgdata` URL query parameter or by explicitly adding the plugin inside your editor

> [!IMPORTANT]
> The draw.io plugins are not stored inside the diagram file. They need to be enabled on every editor with which you want to edit the diagram!

![Screenshot of SVG export on draw.io](./docs/svg-export.png)

## Local flight computer setup

The `fc.Dockerfile` can be used to build a docker image containing a built version of the flight computer contained in the remote-computers submodule.

The image also contains a mavlink-router which automatically gets started and which expects a config to be mounted at `/etc/mavlink-router/main.conf`.
Additionally, there is also a SSH server running inside the container at port `22` (needs to be mapped to non-standard host port, e.g. `2222`) which allows passwordless root logins. 
This means, `ssh -p 2222 root@localhost` connects into the container.

The `docker-compose.yml` in the project root contains a fully configured setup for such a flight computer. By running `docker compose --profile flight-computer up -d`, there will be a MavLink TCP server at port `5766` to which the local mission control can connect. Also, the SSH server is mapped to port `2222`.

If you want to test a full deployment of the mission control and a flight computer, run `docker compose --profile full up -d`. 
A statically compiled version of the mission control is then available under [http://localhost:8888](http://localhost:8888) which is connected to the flight computer running inside the docker container.
