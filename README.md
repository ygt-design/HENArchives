
# HEN Archives

Welcome to **HEN Archives**!

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Customization](#customization)
- [Contributing](#contributing)
- [Acknowledgments](#acknowledgments)

## Overview

HEN Archives is designed to provide an intuitive interface for managing and displaying archive data. It uses a combination of HTML, CSS, and JavaScript to create a user-friendly and interactive experience.

## Features

- **Interactive Map**: Visualize archive data on an interactive map.
- **Search Functionality**: Quickly find specific items within the archive.
- **Responsive Design**: Ensures compatibility with various devices and screen sizes.
- **Customizable UI**: Easily modify the appearance to match your needs.

## Installation

To get started with HEN Archives, follow these steps:

1. **Clone the repository**
   ```bash
   git clone https://github.com/ygt-design/HENArchives.git
   ```

2. **Navigate to the project directory**
   ```bash
   cd HENArchives
   ```

3. **Open `index.html` in your browser**
   ```bash
   open index.html
   ```

## Usage

### Menu

The menu on the left provides access to different functionalities:

- **Search Bar**: Type in keywords to search the archive.
- **Items Container**: Displays a list of archive items that match the search criteria.
- **Clear Button**: Clears the search input and results.
- **View Map Button**: Opens the interactive map.

### Map

The map displays the nodes and borders, allowing for an interactive exploration of the archive data. Click on nodes to view more details.

## Customization

The project uses the following CSS for styling, which can be found in the `styles.css` file:

```css
.menu {
    position: absolute;
    top: 15px;
    left: 15px;
    color: white;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    font-size: 0.7rem;
    width: 300px;
    gap: 10px;
}

.search-bar-container {
    width: 100%;
}

.search-bar {
    width: 100%;
    background-color: rgb(13, 13, 13);
    color: white;
    font-family: 'Roboto Mono', monospace;
    border: 1px solid #e4e4e4;
    padding: 5px 10px;
}

.search-bar input {
    width: 100%;
    padding: 10px;
    font-size: 0.8rem;
    color: #e4e4e4;
    background-color: rgb(13, 13, 13);
    border: none;
    outline: none;
    font-family: 'Roboto Mono', monospace;
}

.search-bar input::placeholder {
    color: #e4e4e4;
    opacity: 0.8;
}

/* Additional styles omitted for brevity */
```

## Contributing

We welcome contributions from the community! Please follow these steps to contribute:

1. **Fork the repository**
2. **Create a new branch**
   ```bash
   git checkout -b feature-branch
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m "Describe your changes"
   ```
5. **Push to your branch**
   ```bash
   git push origin feature-branch
   ```
6. **Open a pull request**

## Acknowledgments

- Special thanks to the contributors and the open-source community for their valuable input and support.
