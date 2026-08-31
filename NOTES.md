# Connected server

I use filesystem for having a single point of entry for having a local mock system. Later it could be a remote endpoint. At first I forgot to add rules on this mcp. Then I correct it to only allow read operations.

# Skill

I like a git convention from angular team, so I wanna Claude to use it every time it commits. The description with commit inside seems to be enought for now, but I'm pretty sure I'll have to customise it if I have other skills related.

# Command

I add /start-server command, to start locally the project. This way if more customisation is needed in a near future this could be done inside the command and shared accross the team.

The value come from the frequence usage, you'll needs to start your local server for working and it could be a painful operation if not setup correctly for the team.

# Hook

I setup an on-start hook to check the availability of the mock server. It prevent to not working correctly if the folder with mocks isn't available.

# Headless

claude -p "Inside task---mock-db create a json file called users.mock.json where you'll expose the content of the following js function function seed() {
  users = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
  ];
  nextId = 3;
}" --allowedTools Edit,Write

I wanna generate mock file, I forgot to allowTools at first so it doesn't work as expected.