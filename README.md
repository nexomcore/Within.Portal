# WithinLanding 

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## API target switching

When the Angular app runs on `localhost`, `127.0.0.1`, or a private LAN host such as `192.168.1.105`, it uses the local API by default:

```text
http://localhost:5177/api
http://192.168.1.105:5177/api
```

On deployed hosts, it uses the online API by default:

```text
https://app-within-api-np-001.azurewebsites.net/api
```

Override the target from the browser. On localhost, local API is always the default; use `?api=online` only when you deliberately want to test against the online API for that session.

```text
http://localhost:4200/?api=local
http://localhost:4200/?api=online
http://localhost:4200/?apiBase=http://192.168.1.105:5177/api
```

The selected target is saved in localStorage for deployed hosts. Localhost still defaults to the local API unless the URL explicitly includes an override. To reset saved values:

```js
localStorage.removeItem('within.api.target');
localStorage.removeItem('within.api.customBaseUrl');
location.reload();
```

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e 
```

28th May
WebAPI Deployed

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


28th May
New API Added 2
