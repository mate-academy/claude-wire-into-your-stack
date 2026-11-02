# Error Handling Standard for Express Routes

## Trigger Description (When to use)

Use this skill exclusively when the user asks to "create a new route," "add an endpoint," "write a new route," "modify routing logic," or expand the files within the `routes/` directory. Do not use this skill for general questions, testing, or adjusting configuration settings.

## Instructions for completion

1. Any asynchronous code within route handlers (callbacks) in the `routes/` directory must be wrapped in a `try/catch` block.
2. Inside the `catch(error)` block, you must not use `console.log(error)` or send a manual response.
3. You must pass the error to the final Express error handler by calling the `next(error)` function.
4. Example of the correct structure:

```javascript
router.get("/example", async (req, res, next) => {
  try {
    const data = await service.getData();
    res.json(data);
  } catch (error) {
    next(error);
  }
});
```
