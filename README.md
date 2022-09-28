<!-- PROJECT LOGO -->
<br />
<p align="center">

<h1 align="center">Food Array</h1>

  <p align="center">
    An Ecosystem for Automate Groceries with Artificial Intelligence.
    <br />
    <a href="https://zero-oneit.github.io/expresive-tea/"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://codesandbox.io/s/expressive-tea-2kmg7?fontsize=14&hidenavigation=1&theme=dark">View Demo</a>
    ·
    <a href="https://github.com/zerooneit/food-array/issues">Report Bug</a>
    ·
    <a href="https://github.com/zerooneit/food-array/issues">Request Feature</a>
  </p>
</p>
<!-- TABLE OF CONTENTS -->

## Table of Contents

* [About the Project](#about-the-project)
    * [Motivation](#motivation)
    * [Objectives](#objectives)
    * [Built With](#built-with)
* [Getting Started](#getting-started)
    * [Prerequisites](#prerequisites)
    * [Installation](#installation)
    * [Initialization](#initialization)
    * [Test](#test)
* [Contributing](#contributing)
* [Versioning](#versioning)
* [Contributors](#contributors)
* [Code of Conduct](#code-of-conduct)
* [References](#references)

## About the Project
Food Array is an ecosystem of three subprojects that work together to automate the process of suggest groceries list to the users. The three sub-projects are:

| Engine                              | Version    | Description                                 |
|-------------------------------------|------------|---------------------------------------------|
| **Food Array API (agent-rest)**     | TDB        | REST API as Interface for clients.          |
| **Food Array Agent (agent-engine)** | 1.0.0-beta | Intelligent Agents System to run every day. |
| **Food Array Web (agent-web)**      | TDB        | Single Page Web Application.                |


### Motivation
In a world where artificial intelligence takes significant roles in the daily life of the human being, it has collaborated in increasing the efficiency and effectiveness with which we do our day to day, whether in the purchase of products online, the music we listen to and even drive a car automatically. That is why it is important to take a step further by involving artificial intelligence in the home, such as pantry management, perhaps one of the most complicated issues in homes. According to UNEP (United Nations Environment Programs) in 2021 food waste was recorded at 17% of global production (UNEP 2021 p. 20) divided between the foodservice industry, retail and the home, the latter contributing 61% (UNEP 2021 p. 8) of that waste, a fairly high amount.

Much of that waste in the home is due to inefficient ways of managing our pantries, either by over-buying or panic buying which ultimately leads to contributing to the problem, either by ending up discarding surplus or certain foods reach their expiration point; Food Array is a project with a REST API / Web service based on Intelligent Agents in order to work with the minimum of data collected by the application itself, since in the absence of a database these must be collected with the intention of suggesting shopping lists so that these are optimal, that is, the difference between a previously purchased product and the one that is intended to be purchased in the current list is always 0 or close to this value so that a reduction of waste can be inferred as a consequence of a constant movement of the household inventory and not allowing the accumulation of products.

### Objectives
The creation of a REST API / Web service that helps to suggest optimized shopping lists for the decrease of surplus products through Intelligent Agents that use the purchase history to make an assessment and generate the optimal purchase suggestion.
* Create a database with information that can be used in the future to create predictive models for the generation of grocery shopping list suggestions.
* Reduce as much as possible the excess purchases that could be made by taking into account the user's purchase history, allowing the Intelligent Agent to reason to avoid wasting products by over-purchasing.
* Obtain metrics to measure waste due to not having a good organization when buying groceries, these metrics will be captured at all times by the intelligent agent and stored in a database.

### Built With
* [Node.js](https://nodejs.org/en/) - Main Server Framework
* [Typescript](https://www.typescriptlang.org/) - Main Language
* [Inversify](https://github.com/inversify/InversifyJS/) - Used for dependency Injection
* [Reflect Metadata](https://github.com/rbuckton/reflect-metadata) - Used to get code metadata.
* [Jest](https://jestjs.io/) - Used for testing
* [MongoDB](https://www.mongodb.com/) - Used for database

## Getting Started
### Prerequisites
**Important:** This project is still in development, so it is not recommended to use it in production environments, also the next version are required in order to
run the project. `NodeJS` >= 14.0.0, `Typescript` >= 4.0.0 and `MongoDB` >= 4.0.0.

### Installation
1. Clone the repo
```sh 
git clone <repo-url> 
```
2. Run Docker Compose
```bash
docker-compose up -d
```

#### Agent Engine
1. Go to `agent-engine` folder
2. Install NPM packages
```bash 
npm install 
```

#### Agent REST
> In progress

#### Agent Web
> In progress

### Initialization
#### Agent Engine
1. Go to `agent-engine` folder
2. Initialize Swarm Agent
```bash 
npm run swarm:init 
```
3. Initialize Sku Collections
```bash
npm run populate:sku
```
4. Initialize Testing Events
```bash
npm run populate:events
```

#### Agent REST
> In progress

#### Agent Web
> In progress

### Test

#### Agent Engine
1. Go to `agent-engine` folder
2. Initialize Swarm Agent
```bash 
npm test
```


#### Agent REST
> In progress

#### Agent Web
> In progress

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning
We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/zerooneit/food-array/tags).

## Contributors
* **Diego Resendez** - *Developer / Author* - [zerooneit](https://github.com/zerooneit)
* **John Arboleda** - *Developer / Author* - [JohnInvent](https://github.com/JohnInvent)

See also the list of [contributors](https://github.com/zerooneit/food-array/contributors) who participated in this project.

## Code of Conduct
## References

