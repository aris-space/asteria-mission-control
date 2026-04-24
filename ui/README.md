# asteria-mission-control-ui

Frontend for the ASTERIA mission control

## Views

At the moment, there is nothing like an index page. Therefore, you can only change/select a view by entering the path manually. 

Currently, the following views are available under the following paths:
- **State machine**: The state machine view is available under `/statemachine`
- **PSS**: The PSS view is available under `/pss`
- **Health**: The health view is available under `/health`
- **Telemetry**: The telemetry view is available under `/telemetry`

## Development setup

To start off, you need to clone the mission control repository locally.

Everything UI related is located in the `ui` subdirectory. So every command in the following section needs to be run in the `ui` directory unless stated otherwise.

```bash
# Install npm packages.
npm i

# Start development server.
npm run dev
```

After running those commands, you should be able to visit the local UI under [http://localhost:5173](http://localhost:5173) in your browser.

In order for the UI to work properly, it needs to communicate with the backend. You can set the `API_URL` environment variable to specify the location of your backend. 

>[!NOTE]
> For the development setup, the `.env.development` file already contains this environment variable.
> It is set to using a local backend per default. Therefore, once you start a local backend on port `8899` everything should work.


When started using `npm run dev`, the UI is running with hot-reloading enabled. Changes in the code should be reflected automatically on the running website without needing to reload.

## Generating API client

All our API clients are generated from the OpenAPI schema served by the backend. The api client code resides locally in the `packages/api-client` directory. Most of the code in there is auto-generated and should therefore not be edited manually. 

To generate the API client for the current backend version, you'll first need to have a local backend running on port `8899` (which is the default). Once you have a backend running, you can generate the API client using

```bash
# Generate API client from OpenAPI schema which is served by local backend.
npm run generate-client
```

After generating a new API client, it's important to check the changes in the `packages/api-client` directory into git.

>[!NOTE]
> Ideally, we wouldn't have the API client package version controlled in our UI source. 
> Instead, we should create and update an npm package as part of our backend CI. However, since 
> we only have very limited GitHub storage space and no self-hosted npm registry (yet) this is 
> the best and easiest solution we have currently.