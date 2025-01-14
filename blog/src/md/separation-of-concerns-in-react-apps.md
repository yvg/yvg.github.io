---
title: "Separation of concerns in React Apps"
date: 2021-03-16
---

Mar. 16, 2021

# Separation of concerns in React Apps

<p class="info">
  This article was orginally published at <a href="https://tooltime.tech/react-apps-separation-of-concerns/">tooltime.tech</a>, it has been copied for archiving purposes.
</p>

If your React application is difficult to maintain it might be due to the lack of **separation of concerns,** ToolTime's Apps were encountering such difficulties a year ago.‌‌ The newly hired Engineering Team decided to transform an experimental MVP application, which was mixing concerns and therefor hard to maintain, into a stable, scalable, modular, and qualitative one, with clear separations.

## What is separation of concerns?

Good question.

In the late 2000s, Web Developers would identify concerns such as **Content (HTML),** **Styling (CSS)** and **Interactions (JavaScript).** If the website was build using a dynamic language such as PHP, one could identify additional concerns, for example Business Logic, Session Persistence, Database Queries (SQL), and many more.

It used to be pretty common to write HTML (or PHP) files that would mix multiple, if not all of those concerns in a single file. HTML4 was even enabling developers to define styling with HTML tags such as `<font>`, `<marquee>`, or `<blink>`. Nowadays, if we want to achieve effects such as the `<blink>` tag offered, we would write a CSS animation and target an HTML element with a CSS selector, if we want to display bold text for purely stylistic reasons, we would use the `font-weight` CSS property instead of using the `<b>` tag.

In React Apps we find many similarities with early days websites. Let us go through some of the concerns we have identified and systematically separated in our apps in order to reduce file length, increase clarity, allow for higher collaboration through modularity, and higher maintainability through conventions.

## Concerns in React

Before we dive deeper, let us get familiar with the goal of React, by reading the first line in the [React documentation](https://reactjs.org/docs/getting-started.html?ref=tooltime.tech).

> React is a JavaScript library for building user interfaces.

Alright, let's identify the common concerns of a user interface:

- Routing
- Content
- Styling
- Interactions

## Routing

**🛣 Routing binds a URL to a React component.**

When we enter a URL in our browser, or when we click on a link, we expect the application to load a page. In a Single Page Application, this is the responsibility of a Router.

Various React apps introduce complexity by using a mixture of two paradigms: **Application routing** and **Nested routing.**

Let us define these two terms first to create common understanding with the examples of react-router-dom. In these examples we will imagine a simple application that routes to a home page, a user profile, and a user profile edit page.

**Application routing** introduces a unique application-wide Router and associated routes, listening to URL changes, and its responsibility is to render a different page for each route.

```js
// App.jsx
const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" component={<HomePage />} />
        <Route path="/profile/:username" component={<ProfilePage />} />
        <Route path="/profile/:username/edit" component={<ProfileEditPage />} />
      </Switch>
    </Router>
  );
};
```

**Nested routing** introduces multiple routers nested within each other. In this example the App.jsx file includes a <Router>, and so does the ProfileWithRouter.jsx file.

```js
// App.jsx
const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" component={<HomePage />} />
        <Route path="/profile/:username" component={<ProfileWithRouter />} />
      </Switch>
    </Router>
  );
};

// ProfileWithRouter.jsx
const ProfileWithRouter = () => {
  const match = useRouteMatch();
  return (
    <Router>
      <Switch>
        <Route path={`${match.path}/edit`} component={<ProfileEditPage />} />
        <Route path={match.path} component={<ProfilPage />} />
      </Switch>
    </Router>
  );
};
```

Now, if the **Nested routing** principle follows clear team conventions across the whole application, and is perhaps even enforced through tooling, then this approach is not, per se, a knotty strategy. However, if conventions cannot be enforced or aren't followed, it can lead to maintainability issues. In our Apps, it led to vague responsibilities, and **obscurity** about which components handle which routes, why, and how, one of the many questions was "should these components also render content?". We found it made it particularly hard for a new team to take over a project, or for a new colleague to get a quick understanding of the application.

**Application routing** has an advantage in that it offers **centralised clarity** about all reachable parts of the application, if properly isolated it does not even need to live in App.jsx, it can live in its own file, away from other UI concerns. So we moved all routing logic to an **Application routing** strategy and isolated it like so:

1. Store routes as an array of objects

```js
// Routes.js
export const routes = [
  {
    path: "/",
    component: HomePage,
  },
  {
    path: "/profile/:id",
    component: ProfilePage,
  },
  {
    path: "profile/:id/edit",
    componentt: ProfileEditPage,
  },
];
```

2. Consume the routes in a router:

```js
// Router.jsx
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { routes } from './routes';

export const Router = () => {
  return (
    <BrowserRouter>
      <Switch>
        {routes.map({ path, component }) => {
          <Route path={path} component={component} />
        })}
      </Switch>
    </BrowserRouter>
  );
};
```

3. Import the router in the App

```js
// App.jsx
import { Router } from "Router";

export const App = () => {
  return <Router />;
};
```

This solution is not unique to ToolTime, it is already widely used by the React community, and is central to many opinionated frameworks such as Backbone, Vue, or Angular.

So this is how we solved Routing: we centralised the routing logic, and removed nested routing from components. Developers benefit from clarity, and routing concerns are separated from other concerns.

---

## Content

**📰 Content describes the semantics of a component.**

It might be interactive content such as `<video>`, or `<img>`. Or actionable content like form elements with `<button>` or `<input>`, or a link to another page with an anchor tag `<a>`. In most cases however, it will be text described as paragraphs with `<p>`, headings with `<h1>`, `<h2>`,… unordered lists with `<ul>`, etc. And other tags such as `<main>`, `<section>` to structure the content in a page.

For this example we will render a blog post with what is known as **divitus**, the excessive usage of `<div>`, in detriment of semantic HTML tags.

```js
// BlogPost.jsx
export const BlogPost = () => {
  return (
    <>
      <div>How much I like banana bread</div>
      <div>
        I looooove banana bread!
        <br />
        Very very much!
      </div>
    </>
  );
};
```

The above example has no semantic value: a browser, a search engine, or a screen-reader is unable to tell which text is the title, and which text is the post's content.

Let's solve this with semantics:

```js
// BlogPost.jsx
export const BlogPost = () => {
  return (
    <>
      <h1>How much I like banana bread</h1>
      <p>
        I looooove banana bread! <br />
        Very very much!
      </p>
    </>
  );
};
```

This was easy. Beyond semantics, HTML also provides build-in functionalities, such as form validation, dns pre-fetching, and much more. Check out the [MDN HTML guide](https://developer.mozilla.org/en-US/docs/Web/HTML?ref=tooltime.tech) for more.

### ⚠️ Content anti-patterns

Beware of anti-patterns, many React components available throughout the libraries in the community, will provide some functionality without rendering anything.

While this is accepted by many as "normal", we do believe that this goes beyond the responsibilities of a UI library. Expressing functionalities, such as data-fetching for example, are better expressed with functions, or with React hooks, than they are with JSX.

For example we forbid the usage of Apollo's `<Query>` component, instead we rely on Apollo's functional API to fetch data and extract that responsibility to a different file.

Alright let's dive into the next topic: Styling.

---

## Styling

**💅 Styling defines the look and feel of a component.**

Many tools such as JSS, CSS Modules, Emotion,… can be used to style components.
What is also pretty common in various documentations is to "co-locate" styles with the component functionality in the same file, such as this:

```js
// BlogPost.jsx
const styles = {
  title: {
    color: 'red'
  }
};

export const BlogPost = () => {
  return (
    <h1 className={styles.title}>How much I like banana bread</h1>
    <p>I looooove banana bread!</p>
    <p>Very very much!</p>
  );
};
```

While this might seem harmless in many cases, it becomes increasingly difficult to maintain when the styles grow in size, and the component grows in complexity.

The solution we advocate, is to separate these two concerns in different files, no matter how many lines of code, the result then looks somewhat like this:

```js
// BlogPost.styles.js
export const styles = {
  title: {
    color: "red",
  },
};
```

```js
// BlogPost.jsx
import { styles } from './BlogPost.styles';
export const BlogPost = () => {
  return (
    <h1 className={styles.title}>How much I like banana bread</h1>
    <p>I looooove banana bread!</p>
    <p>Very very much!</p>
  );
};
```

Beyond the advantage of creating smaller clearer maintainable files, the next author won't have to break up a file that grew in complexity.

## Interactions

Let's imagine we want to render a button that behaves as a toggle for an information to be displayed below (that I love banana bread).

```js
// ButtonWithContent.jsx
export const ButtonWithContent = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const clickHandler = () => {
    setIsEnabled(!isEnabled);
  };
  return (
    <>
      <button onClick={clickHandler}>Toggle information</button>
      {isEnabled && <p>I love banana bread</p>}
    </>
  );
};
```

This component contains multiple concerns now:

- A state `isEnabled` and its setter `setIsEnabled` expressed via React's `useState` hook.
- An event handler `clickHandler` toggling the state everytime the button is clicked.
- Stateful JSX that will conditionally render the `<p>` content.

Again, in many cases this will seem harmless, the file feels small and readable, but as soon as the feature grows in complexity, the next developer will need to decide to keep adding to it, or to move these concerns to a different file.

Moving behaviours out of the component can be achieved immediately, one way is to use React Hooks like so:

```js
// ButtonWithContent.behaviour.js
export const useButtonWithContentBehaviour = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const clickHandler = () => {
    setIsEnabled(!isEnabled);
  };
  return {
    clickHandler: clickHandler,
    isEnabled: isEnabled,
  };
};
```

Now the concerns of interactions are separated from the component's rendering concerns. The component calls a hook to retrieve the state and the click handler from the behaviour:

```js
// ButtonWithContent.jsx
import { useButtonWithContentBehaviour } from "./ButtonWithContent.behaviour";
export const ButtonWithContent = () => {
  const { clickHandler, isEnabled } = useButtonWithContentBehaviour();
  return (
    <>
      <button onClick={clickHandler}>Toggle information</button>
      {isEnabled && <p>I love banana bread</p>}
    </>
  );
};
```

## Finally

We follow these principles because we find that they work for us, not every solution fits every context, you might need to adapt these ideas slightly to fit your needs, or perhaps you will need to look elsewhere for other solutions.

To us, large intricated software problems, become **small solvable problems** when they are split. Defining boundaries and responsibilities helped us refactor large messy files into clearer, smaller, maintainable files ; eventually this discipline has led to more readable, scalable, and testable software.
