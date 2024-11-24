# Python workspace

## `uv` Questions

- How to work with dependencies in the overarching workspace?
  - Is there a way to gather all the dependencies from the projects in this workspace into this workspace's `pyproject.toml`
  - Or is there otherwise a way to install all dependencies from the `uv.lock` file?  
    That `uv.lock` file is managed for the entire workspace, right?  
    So I should be able to create a single `.venv` that allows me to run all projects (apps & packages) in this workspace, right?
