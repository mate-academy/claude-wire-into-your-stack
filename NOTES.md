# Project

Which server did you connect, why is it useful here, and what did your permission rule allow?
- The MCP server filesystem was used in order to create or edit documentation in project. Permissions allowed:
    - "read_text_file",
    - "write_file",
    - "edit_file"

What repeated way of working did your skill capture, and how did you word the description so it fires?
- a skill related to how a route is written was created
- it was triggered correctly and the action completed as expected by creating the `todos.js` file

What command did you add, and what makes it worth a shortcut?
- the command /docs-list was added and it is able to list all markdown documentation files in the project directoies and sub-directories
- the command also allow one parameter with the name of directory to search for docs

What hook did you set — does it react or prevent, and on which event?
- a post-mortem hook was created that checks the location where documnetation is created
- the test required the documentation file `create-user.md` to be created outside directory `docs/` but the file was moved to directory `docs/`

What did you run headless, and what did you lock down?
- the command was
```bash
claude -p 'fa-mi un fisier de documentatie despre cum stergi un user delete-user.md; doar scrie documentul fara implementare' --allowedTools "Write"
```
- the reply was
```
Am scris `docs/delete-user.md` — documentează endpoint-ul `DELETE /users/:id` (care nu există încă în cod), urmând convențiile și stilul lui `docs/create-user.md`. Am notat explicit că e doar documentație, fără implementare.
```
