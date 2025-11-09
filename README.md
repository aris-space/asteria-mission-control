# asteria-mission-control

## Backend API

### Usage

The built binary has some bundled CLI flags which can be used to configure the API before starting. Note that most flags can also be set using environment variables.

To get an overview of the available flags, run the binary with the `--help` argument.

### Documentation

The API is documented using [OpenAPI](https://www.openapis.org/). An interactive playground of the API is available under the `/docs/ui` path and the OpenAPI schema can be found under the `/docs/openapi.json` path.

In general, all API endpoints except the ones used for documentation are prefixed with `/api/` to allow serving the static UI from the API directly using [actix-files](https://crates.io/crates/actix-files).

## UI

The code for the mission control UI is located in [the ui subdirectory](./ui/)
