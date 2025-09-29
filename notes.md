# CS 260 Notes

[My startup - Simon](https://simon.cs260.click)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)

## AWS

My IP address is: 54.81.96.130
Launching my AMI I initially put it on a private subnet. Even though it had a public IP address and the security group was right, I wasn't able to connect to it.

## Caddy

No problems worked just like it said in the [instruction](https://github.com/webprogramming260/.github/blob/main/profile/webServers/https/https.md).

## HTML

This was easy. I was careful to use the correct structural elements such as header, footer, main, nav, and form. The links between the three views work great using the `a` element.

The part I didn't like was the duplication of the header and footer code. This is messy, but it will get cleaned up when I get to React.

## CSS

This took a couple hours to get it how I wanted. It was important to make it responsive and Bootstrap helped with that. It looks great on all kinds of screen sizes.

Bootstrap seems a bit like magic. It styles things nicely, but is very opinionated. You either do, or you do not. There doesn't seem to be much in between.

I did like the navbar it made it super easy to build a responsive header.

```html
      <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
          <a class="navbar-brand">
            <img src="logo.svg" width="30" height="30" class="d-inline-block align-top" alt="" />
            Calmer
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link active" href="play.html">Play</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="about.html">About</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="index.html">Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
```

I also used SVG to make the icon and logo for the app. This turned out to be a piece of cake.

```html
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#0066aa" rx="10" ry="10" />
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="72" font-family="Arial" fill="white">C</text>
</svg>
```

## React Part 1: Routing

Setting up Vite and React was pretty simple. I had a bit of trouble because of conflicting CSS. This isn't as straight forward as you would find with Svelte or Vue, but I made it work in the end. If there was a ton of CSS it would be a real problem. It sure was nice to have the code structured in a more usable way.

## React Part 2: Reactivity

This was a lot of fun to see it all come together. I had to keep remembering to use React state instead of just manipulating the DOM directly.

Handling the toggling of the checkboxes was particularly interesting.

```jsx
<div className="input-group sound-button-container">
  {calmSoundTypes.map((sound, index) => (
    <div key={index} className="form-check form-switch">
      <input
        className="form-check-input"
        type="checkbox"
        value={sound}
        id={sound}
        onChange={() => togglePlay(sound)}
        checked={selectedSounds.includes(sound)}
      ></input>
      <label className="form-check-label" htmlFor={sound}>
        {sound}
      </label>
    </div>
  ))}
</div>
```

## GitHub

I learned about GitHub and how it helps version control.

I learned how to do markdown for GitHub such as how to include images.

## Amazon Web Server

Remember to turn off elastic IP when course is over

Elastic IP allows us to shut off server while retaining public IP, otherwise it would change.

## HTML

Every page starts with a <!DOCTYPE html> and has <html>, <head>, and <body> sections.
The <head> contains metadata like <title>, <meta>, and links to styles or scripts.
The <body> contains all the visible content of the webpage.
Use heading tags (<h1>–<h6>) for titles and to give structure to content.
Use <p> for paragraphs of text instead of just line breaks.
Use <ul> and <ol> with <li> for lists, including navigation menus.
Use <a> for hyperlinks to other pages or websites.
Use <table>, <thead>, <tbody>, <tr>, <th>, and <td> for tabular data.
Use <form>, <input>, <button>, and <label> for user input.
Use <header>, <nav>, <main>, <section>, and <footer> for semantic page layout.

## Simon deployment

I can study the basics of how I can use HTML with the provided simon code.
I can deploy files to my website using the following command: ./deployFiles.sh -k <yourpemkey> -h <yourdomain> -s simon

## CSS Selectors

Use element selectors (like body, h1, section) to style by tag name.
Use the wildcard * to select all elements at once.
Use combinators to define relationships:
  section h2 selects all h2 inside section.
  section > p selects p directly inside section.
  h2 ~ p selects p siblings that follow an h2.
  div + p selects the p immediately after a div.
Use class selectors with a period (.classname) to target elements by class.
Use ID selectors with a hash (#idname) to target unique elements.
Use attribute selectors like [href], [class="summary"], or [href*="https://"] to style based on attributes.
Use pseudo selectors like :hover, :visited, :first-child, or :nth-child() to style based on state, position, or interaction.

## CSS Declarations

CSS declarations define a property and value for selected elements.
Common properties: background, border, text color, font, spacing (margin, padding), size (width, height), layout (display, flex, grid, float, position), and effects (shadow, transform, opacity, overflow).
Units can be absolute (px, pt, in, cm), relative (%, em, rem, ex), or viewport-based (vw, vh, vmin, vmax).
Colors can be defined by keywords (red, blue), hex codes, RGB/RGBA functions, or HSL/HSLA functions.

# CSS Fonts

Fonts affect readability and design quality — good fonts improve user experience, bad fonts drive users away.
Use font-family to define fonts. Provide an ordered list so the browser uses the first available font.
Main font families:
  Serif (with decorative strokes).
  Sans-serif (clean, no strokes).
  Monospace / fixed (equal-width characters, good for code/data).
  Symbol (icons, arrows, emojis).
Fonts can be imported instead of relying only on system defaults.
  Use @font-face to load a custom font from your server.
  Use @import (e.g., Google Fonts) to load hosted fonts easily.