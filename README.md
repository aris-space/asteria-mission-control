# asteria-mission-control

## Backend

### Usage

The built binary has some bundled CLI flags which can be used to configure the API before starting. Note that most flags can also be set using environment variables.

To get an overview of the available flags, run the binary with the `--help` argument.

### Documentation

The API is documented using [OpenAPI](https://www.openapis.org/). An interactive playground of the API is available under the `/docs/ui` path and the OpenAPI schema can be found under the `/docs/openapi.json` path.

In general, all API endpoints except the ones used for documentation are prefixed with `/api/` to allow serving the static UI from the API directly using [actix-files](https://crates.io/crates/actix-files).

### Config

The backend needs a config file. The path of the config file can be specified as a CLI flag or through the `CONFIG_PATH` environment variable (see [usage](#usage)). 

At the moment, the config file is used to specify the scenarios which are available. You can think of a scenario to be a deployment (e.g. for a drop test or an engine test). At the moment, a scenario just specifies where it's state machine diagrams are found and which state machines it has. 

The config is writtein in TOML and follows the following schema:
```toml
# name of the scenario which should be selected by default
default_scenario = "drop-test-1"

# every scenario has an unique identifier (here `drop-test-1`)
[scenario.drop-test-1]
# name of the scenario which will be displayed in the UI
name = "Drop Test #1"
state_machines = ["fc"]

# similar to how every scenario has an unique identifier, every state machine
# also has an unique identifier (in this case `fc`)
[state_machine.fc]
# name of the state machine which will be displayed in the UI
name = "Flight Computer"
# path to the state machine drawio svg+xml diagram
# the path can be a relative path to the location of the config file
diagram_path = "flight-computer.svg"
# path to the remote computer config file for this state machine 
# the path can be a relative path to the location of the config file
config_path = "flight-computer.toml"
```

A schema for the config file is hosted by the backend on the `/api/config/schema` path.

## UI

The code for the mission control UI is located in [the ui subdirectory](./ui/)
