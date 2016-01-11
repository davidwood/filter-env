# filter-env

`filter-env` iterates over `process.env` and returns an object containing environment variables whose name matches a regular expression. Optionally, it can parse environment variable values as JSON.

## Usage

```
const config = filterEnv(/^TEST-/, { json: true, freeze: true });
```

### Arguments

* `validate`: A validation function or regular expression to test the environment variable key
* `options`: Optional configuration
    * `json`: `true` to parse environment variable value as JSON. Throws an error if a value is not valid JSON. Defaults to `false`
    * `immutable`: `true` to freeze the returned object (and child objects). Defaults to `false`
    * `format`: A function that formats the environment variable name in the returned object. If the format function returns a key that already exists, the variable will not be included in the returned object. By default, the key is not changed.