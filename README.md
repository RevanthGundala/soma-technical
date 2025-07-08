## Soma Capital Technical Assessment

This is a technical assessment as part of the interview process for Soma Capital.

> [!IMPORTANT]  
> You will need a Pexels API key to complete the technical assessment portion of the application. You can sign up for a free API key at https://www.pexels.com/api/  

To begin, clone this repository to your local machine.

## Development

This is a [NextJS](https://nextjs.org) app, with a SQLite based backend, intended to be run with the LTS version of Node.

To run the development server:

```bash
npm i
npm run dev
```

## Task:

Modify the code to add support for due dates, image previews, and task dependencies.

### Part 1: Due Dates 

When a new task is created, users should be able to set a due date.

When showing the task list is shown, it must display the due date, and if the date is past the current time, the due date should be in red.

### Part 2: Image Generation 

When a todo is created, search for and display a relevant image to visualize the task to be done. 

To do this, make a request to the [Pexels API](https://www.pexels.com/api/) using the task description as a search query. Display the returned image to the user within the appropriate todo item. While the image is being loaded, indicate a loading state.

You will need to sign up for a free Pexels API key to make the fetch request. 

### Part 3: Task Dependencies

Implement a task dependency system that allows tasks to depend on other tasks. The system must:

1. Allow tasks to have multiple dependencies
2. Prevent circular dependencies
3. Show the critical path
4. Calculate the earliest possible start date for each task based on its dependencies
5. Visualize the dependency graph

## Submission:

1. Add a new "Solution" section to this README with a description and screenshot or recording of your solution. 
2. Push your changes to a public GitHub repository.
3. Submit a link to your repository in the application form.

Thanks for your time and effort. We'll be in touch soon!

## Solution

![Solution Screenshot](./assets/soma.png)

### Part 1: Due Dates
- **Due Date Picker:** A date input has been added to the task creation form, allowing users to select a due date for new tasks.
- **Display Due Dates:** The task list now displays the due date for each task.
- **Overdue Highlighting:** If a task's due date is in the past, it is highlighted in red to draw attention to it.

### Part 2: Image Generation
- **Pexels API Integration:** The application is integrated with the Pexels API to fetch images related to the task's title.
- **Automatic Image Fetching:** When a new task is created, an image is automatically fetched from Pexels and associated with the task.
- **Image Display:** The fetched image is displayed within the task item in the list, providing a visual representation of the task.

### Part 3: Task Dependencies
- **Dependency Management:** Users can now define dependencies between tasks. A task can have multiple dependencies on other tasks.
- **Circular Dependency Prevention:** A check has been implemented to prevent users from creating circular dependencies (e.g., Task A depends on Task B, and Task B depends on Task A).
- **Critical Path Calculation:** The application calculates the critical path of the project, which is the longest sequence of dependent tasks.
- **Earliest Start Date:** The earliest possible start day for each task is calculated and displayed, based on its dependencies.
- **Dependency Graph Visualization:** A dependency graph is generated and displayed using Mermaid.js. The graph visualizes the relationships between tasks, and the tasks on the critical path are highlighted.

# soma-technical
# soma-technical
