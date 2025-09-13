---
author: Jonathan Nenba
pubDatetime: 2022-12-30T11:16:18Z
modDatetime: 2022-12-30T11:16:18Z
title: 'MutationObserver to listen to any HTML element in your DOM(Javascript).'
slug: mutationobserver-to-listen-to-any-html-element-in-your-dom-javascript
featured: false
draft: false
tags:
  - javascript
  - mutationObserver
  - software engineering
  - programming
  - technology
description: Learn how to use MutationObserver to monitor changes to HTML elements in your DOM in JavaScript.
---

Hello, I'm going to share with you a little today about a problem I recently encountered and how I solved it!

I had a container (a div) in my HTML page that contained a number of elements about 10 of them were also div, but these elements were changing by another code every second (I didn't control this part of the code, it was made by an external library), I wanted that each element that was in my container could have a specific property like tabIndex=-1, but the other code was setting it to 0 automatically every second.

To solve this problem I used the MutationObserver class of javascript to know all the events that happened in my container and apply my changes when the time came.

### What is MutationObserver ?

If I refer to the documentation provided by MDN, `MutationObserver` provides a way to intercept changes in the [DOM](https://developer.mozilla.org/fr/docs/Web/API/Document_Object_Model). It was designed to replace the [Mutation Events](https://developer.mozilla.org/fr/docs/DOM/Mutation_events "This is a link to an unwritten page") defined in the DOM3 Events specification.

To help you understand more clearly how it happens, let's imagine a scenario:

Let's say we want to have span elements with property tabIndex=0 in a div, and every second a code will add another span element with property tabIndex=0 in our div, so our task would be to change all the elements in our div with tabIndex=0 and set it to -1

```html
<html>
<body>
  <div class="container">
    <span tabIndex="0">Child</span>
    <span tabIndex="0">Child</span>
    <span tabIndex="0">Child</span>
    <span tabIndex="0">Child</span>
  </div>
  <script type="text/javascript">
    // Our JavaScript code will therefore be here.
  </script>
</body>
</html
```

The implementation of the observer is really simple, we need to create an instance of the MutationObserver class and pass it a function that will be executed each time an update is applied to our element.

```javascript
const container = document.getElementsByClassName('container')[0];
const callback = mutations => {
  mutations.forEach( mutation => {
    if(mutation.type =="childList") {
      container.childNodes.forEach((node) => {
        node.setAttribute('tabIndex', "-1");
      }); 
    };
  })
}
const observer = new MutationObserver(callback);
if(container) observer.observe(container, { childList: true });

```

Note: you should always implement a logic that allows you to disconnect your observer when you finish the task, or when you change page. On React for example you can write the function that will do this when your component is unmounted for example.

```javascript
observer.disconnect();
```

What we have done is to define our callback that will update the tabIndex of our elements in our container to -1, to do this we need to know what type of mutation has happened to our container, because it can have different types (Please read the documentation). When the cllback is ready we create our object passing the callback to the constructor and then we call the observe function passing the element(node) we want to observe and also an object with the types of mutation we want to listen.

There are several use cases where you will be able to use the MutationObserver. It offers a number of advantages compared to querying or other solutions. It is much more optimized because it triggers changes in batches.  The MutationObserver API is powerful and informative.

That's it for this little introductory post to the MutationObeserver, I think I have given you some ideas and solved some of your problems.

See you soon on my blog.

* [[1] MDN Web Docs "MutationObserver" , https://developer.mozilla.org/fr/docs/Web/API/MutationObserver](https://developer.mozilla.org/fr/docs/Web/API/MutationObserver)
* [[2] Shuvo Habib Blog's "Listening to DOM changes by Javascript Web API, Mutation Observer (hint: It’s the best practice)" , https://shuvohabib.medium.com/listening-to-dom-changes-by-javascript-web-api-mutation-observer-hint-its-the-best-practice-3ee92dc8aac6](https://shuvohabib.medium.com/listening-to-dom-changes-by-javascript-web-api-mutation-observer-hint-its-the-best-practice-3ee92dc8aac6)
