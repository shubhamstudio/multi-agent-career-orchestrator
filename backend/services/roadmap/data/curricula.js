const resource = (title, url) => ({ type: "official-docs", title, url });

const topic = (id, title, section, difficulty, duration, description, prerequisites = [], resources = [], type = "required") => ({
  id, title, section, difficulty, duration, description, prerequisites, resources, type,
});

export const curricula = {
  "frontend-developer": {
    slug: "frontend-developer",
    title: "Frontend Developer Roadmap",
    version: 1,
    defaultWeeks: 16,
    nodes: [
      topic("web-foundations", "How the Web Works", "Foundations", "Easy", "3 days", "Understand browsers, DNS, HTTP, URLs, and the request-response lifecycle.", [], [resource("MDN: How the web works", "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works")]),
      topic("html", "Semantic HTML", "Foundations", "Easy", "1 week", "Build accessible document structures using meaningful elements, forms, and browser-native behavior.", ["web-foundations"], [resource("MDN HTML", "https://developer.mozilla.org/en-US/docs/Web/HTML")]),
      topic("css", "CSS Layout and Responsive Design", "Foundations", "Easy", "2 weeks", "Create responsive interfaces with the cascade, flexbox, grid, media queries, and reusable layout patterns.", ["html"], [resource("MDN CSS", "https://developer.mozilla.org/en-US/docs/Web/CSS")]),
      topic("javascript", "Modern JavaScript", "Programming", "Medium", "3 weeks", "Use functions, modules, objects, collections, asynchronous code, and browser APIs confidently.", ["html"], [resource("MDN JavaScript Guide", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide")]),
      topic("git", "Git and Collaborative Workflow", "Tooling", "Easy", "4 days", "Work safely with commits, branches, pull requests, reviews, and conflict resolution.", [], [resource("Git Documentation", "https://git-scm.com/doc")]),
      topic("typescript", "TypeScript", "Programming", "Medium", "2 weeks", "Model application data with useful types, narrow unknown values, and design maintainable interfaces.", ["javascript"], [resource("TypeScript Handbook", "https://www.typescriptlang.org/docs/handbook/intro.html")]),
      topic("react", "React Application Development", "Framework", "Medium", "3 weeks", "Build component-driven interfaces with state, effects, composition, routing, and reusable hooks.", ["javascript"], [resource("React Documentation", "https://react.dev/learn")]),
      topic("accessibility", "Web Accessibility", "Quality", "Medium", "1 week", "Design keyboard-friendly, screen-reader-friendly interfaces with clear semantics and focus behavior.", ["html", "css"], [resource("W3C WAI Fundamentals", "https://www.w3.org/WAI/fundamentals/accessibility-intro/")]),
      topic("frontend-testing", "Frontend Testing", "Quality", "Medium", "2 weeks", "Test user-visible behavior with unit, component, and end-to-end testing strategies.", ["react"], [resource("Testing Library Documentation", "https://testing-library.com/docs/")]),
      topic("web-performance", "Web Performance", "Quality", "Hard", "1 week", "Measure and improve loading, rendering, asset delivery, and interaction responsiveness.", ["react"], [resource("web.dev Performance", "https://web.dev/learn/performance/")]),
      topic("frontend-security", "Frontend Security", "Quality", "Hard", "1 week", "Recognize browser security boundaries and prevent common injection, authentication, and data-handling mistakes.", ["javascript"], [resource("OWASP Web Security Testing Guide", "https://owasp.org/www-project-web-security-testing-guide/")]),
      topic("frontend-project", "Production Frontend Project", "Portfolio", "Hard", "3 weeks", "Ship an accessible, tested, responsive application and document the technical decisions behind it.", ["typescript", "react", "frontend-testing", "web-performance", "frontend-security"]),
    ],
  },
  "backend-developer": {
    slug: "backend-developer",
    title: "Backend Developer Roadmap",
    version: 1,
    defaultWeeks: 18,
    nodes: [
      topic("programming-foundations", "Programming Foundations", "Foundations", "Easy", "2 weeks", "Practice control flow, functions, data structures, error handling, and modular program design.", [], [resource("JavaScript Guide", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide")]),
      topic("git", "Git and Collaborative Workflow", "Foundations", "Easy", "4 days", "Use commits, branches, pull requests, reviews, and conflict resolution in a team workflow.", [], [resource("Git Documentation", "https://git-scm.com/doc")]),
      topic("http", "HTTP and Web Fundamentals", "Web", "Easy", "1 week", "Understand requests, responses, methods, status codes, headers, cookies, caching, and TLS.", ["programming-foundations"], [resource("MDN HTTP", "https://developer.mozilla.org/en-US/docs/Web/HTTP")]),
      topic("runtime-framework", "Backend Runtime and Framework", "Web", "Medium", "2 weeks", "Build modular server applications with routing, configuration, middleware, and structured error handling.", ["programming-foundations", "http"], [resource("Node.js Documentation", "https://nodejs.org/docs/latest/api/")]),
      topic("relational-databases", "Relational Databases and SQL", "Data", "Medium", "2 weeks", "Design relational schemas and write reliable queries, joins, indexes, constraints, and transactions.", ["programming-foundations"], [resource("PostgreSQL Documentation", "https://www.postgresql.org/docs/current/")]),
      topic("api-design", "REST API Design", "Web", "Medium", "2 weeks", "Design predictable resource-oriented APIs with validation, pagination, versioning, and consistent errors.", ["runtime-framework", "relational-databases"], [resource("OpenAPI Specification", "https://spec.openapis.org/oas/latest.html")]),
      topic("authentication", "Authentication and Authorization", "Security", "Hard", "2 weeks", "Implement sessions or tokens, password security, permissions, and secure authorization checks.", ["api-design"], [resource("OWASP Authentication Cheat Sheet", "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html")]),
      topic("backend-testing", "Backend Testing", "Quality", "Medium", "2 weeks", "Cover domain logic and API behavior with unit, integration, and contract tests.", ["api-design"], [resource("Node.js Test Runner", "https://nodejs.org/api/test.html")]),
      topic("caching", "Caching and Redis", "Scale", "Hard", "1 week", "Use caching intentionally, choose invalidation strategies, and protect consistency across data layers.", ["api-design", "relational-databases"], [resource("Redis Documentation", "https://redis.io/docs/latest/")]),
      topic("containers", "Containers and Deployment", "Operations", "Medium", "2 weeks", "Package services, configure environments, perform health checks, and deploy repeatable builds.", ["runtime-framework", "git"], [resource("Docker Documentation", "https://docs.docker.com/")]),
      topic("observability", "Logging and Observability", "Operations", "Hard", "1 week", "Add structured logs, metrics, tracing, and actionable health signals to production services.", ["containers"], [resource("OpenTelemetry Documentation", "https://opentelemetry.io/docs/")]),
      topic("system-design", "Backend System Design", "Scale", "Hard", "3 weeks", "Reason about reliability, queues, partitioning, consistency, failure modes, and scaling trade-offs.", ["authentication", "caching", "observability"], [resource("AWS Well-Architected Framework", "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html")]),
      topic("backend-project", "Production Backend Project", "Portfolio", "Hard", "3 weeks", "Ship a documented, tested API with persistence, authentication, caching, deployment, and monitoring.", ["backend-testing", "system-design"]),
      topic("graphql", "GraphQL Fundamentals", "Specialization", "Hard", "1 week", "Learn schema design, resolvers, query costs, and when GraphQL is preferable to REST.", ["api-design"], [resource("GraphQL Documentation", "https://graphql.org/learn/")], "optional"),
    ],
  },
  "machine-learning-engineer": {
    slug: "machine-learning-engineer",
    title: "Machine Learning Engineer Roadmap",
    version: 1,
    defaultWeeks: 22,
    nodes: [
      topic("python", "Python for Data Work", "Foundations", "Easy", "3 weeks", "Write clear Python using functions, classes, environments, typing, NumPy, and tabular data tools.", [], [resource("Python Documentation", "https://docs.python.org/3/tutorial/")]),
      topic("git", "Git and Experiment Workflow", "Foundations", "Easy", "4 days", "Version code and experiment configuration while collaborating through branches and reviews.", [], [resource("Git Documentation", "https://git-scm.com/doc")]),
      topic("math", "Applied Mathematics for ML", "Foundations", "Medium", "3 weeks", "Build working intuition for linear algebra, probability, statistics, gradients, and optimization.", ["python"], [resource("Mathematics for Machine Learning", "https://mml-book.github.io/")]),
      topic("data-preparation", "Data Preparation", "Data", "Medium", "2 weeks", "Inspect, clean, transform, split, and validate datasets while preventing leakage.", ["python", "math"], [resource("pandas Documentation", "https://pandas.pydata.org/docs/")]),
      topic("classical-ml", "Classical Machine Learning", "Modeling", "Medium", "3 weeks", "Train and compare supervised and unsupervised models using reproducible evaluation practices.", ["data-preparation"], [resource("scikit-learn User Guide", "https://scikit-learn.org/stable/user_guide.html")]),
      topic("model-evaluation", "Model Evaluation", "Modeling", "Hard", "2 weeks", "Choose meaningful metrics, establish baselines, tune models, and analyze errors and bias.", ["classical-ml"], [resource("scikit-learn Model Evaluation", "https://scikit-learn.org/stable/modules/model_evaluation.html")]),
      topic("deep-learning", "Deep Learning", "Modeling", "Hard", "3 weeks", "Build and train neural networks while understanding optimization, regularization, and common architectures.", ["math", "classical-ml"], [resource("PyTorch Documentation", "https://pytorch.org/docs/stable/index.html")]),
      topic("data-systems", "Data and Feature Pipelines", "Engineering", "Hard", "2 weeks", "Create reproducible pipelines for ingestion, validation, transformation, and feature computation.", ["data-preparation", "git"], [resource("Apache Airflow Documentation", "https://airflow.apache.org/docs/")]),
      topic("model-serving", "Model Serving", "Engineering", "Hard", "2 weeks", "Package models behind reliable inference services with validation, batching, and performance controls.", ["model-evaluation", "data-systems"], [resource("FastAPI Documentation", "https://fastapi.tiangolo.com/")]),
      topic("mlops", "MLOps and Experiment Tracking", "Operations", "Hard", "2 weeks", "Version data and models, track experiments, automate delivery, and keep training reproducible.", ["model-serving"], [resource("MLflow Documentation", "https://mlflow.org/docs/latest/")]),
      topic("ml-monitoring", "Production ML Monitoring", "Operations", "Hard", "1 week", "Monitor service health, model quality, drift, and feedback after deployment.", ["mlops"], [resource("OpenTelemetry Documentation", "https://opentelemetry.io/docs/")]),
      topic("ml-project", "End-to-End ML Project", "Portfolio", "Hard", "4 weeks", "Deliver a reproducible model from data preparation through deployment, monitoring, and documentation.", ["deep-learning", "ml-monitoring"]),
      topic("generative-ai", "Generative AI Applications", "Specialization", "Hard", "2 weeks", "Build evaluated applications around foundation models, retrieval, tool use, and safety constraints.", ["deep-learning", "model-serving"], [resource("Hugging Face Documentation", "https://huggingface.co/docs")], "optional"),
    ],
  },
  "data-analyst": {
    slug: "data-analyst",
    title: "Data Analyst Roadmap",
    version: 1,
    defaultWeeks: 16,
    nodes: [
      topic("analytics-foundations", "Data Analytics Foundations", "Foundations", "Easy", "4 days", "Understand the analytics workflow: defining questions, collecting data, validating evidence, and communicating decisions.", [], [resource("Google Data Analytics Guide", "https://developers.google.com/machine-learning/data-prep")]),
      topic("spreadsheets", "Spreadsheets for Analysis", "Foundations", "Easy", "1 week", "Use formulas, lookups, pivot tables, charts, filtering, and clean tabular models to investigate business data.", ["analytics-foundations"], [resource("Microsoft Excel Help", "https://support.microsoft.com/excel")]),
      topic("sql", "SQL for Data Analysis", "Querying", "Medium", "3 weeks", "Query relational data with joins, aggregations, common table expressions, window functions, and reliable filters.", ["analytics-foundations"], [resource("PostgreSQL Documentation", "https://www.postgresql.org/docs/current/")]),
      topic("statistics", "Practical Statistics", "Foundations", "Medium", "2 weeks", "Apply descriptive statistics, distributions, sampling, confidence intervals, hypothesis tests, and experiment basics.", ["analytics-foundations"], [resource("OpenIntro Statistics", "https://www.openintro.org/book/os/")]),
      topic("python", "Python for Analysis", "Programming", "Medium", "3 weeks", "Use Python, pandas, NumPy, notebooks, and reproducible scripts to inspect and transform tabular data.", ["analytics-foundations"], [resource("pandas Documentation", "https://pandas.pydata.org/docs/")]),
      topic("data-cleaning", "Data Cleaning and Quality", "Data", "Medium", "2 weeks", "Profile data, handle missing values, standardize fields, detect anomalies, and document assumptions before analysis.", ["sql", "python"], [resource("pandas User Guide", "https://pandas.pydata.org/docs/user_guide/index.html")]),
      topic("visualization", "Data Visualization", "Communication", "Medium", "2 weeks", "Choose accurate charts, design clear visual encodings, and explain findings for technical and non-technical audiences.", ["statistics", "data-cleaning"], [resource("Data Visualization Catalogue", "https://datavizcatalogue.com/")]),
      topic("bi-tools", "Business Intelligence Dashboards", "Communication", "Medium", "2 weeks", "Build maintainable dashboards with filters, calculated metrics, drill-downs, and documented refresh logic.", ["sql", "visualization"], [resource("Microsoft Power BI Documentation", "https://learn.microsoft.com/power-bi/")]),
      topic("business-metrics", "Business Metrics and Storytelling", "Product", "Hard", "2 weeks", "Define trustworthy KPIs, interpret trends in context, communicate trade-offs, and turn analysis into decisions.", ["statistics", "bi-tools"], [resource("Google Analytics Documentation", "https://developers.google.com/analytics")]),
      topic("analyst-portfolio", "End-to-End Analytics Portfolio Project", "Portfolio", "Hard", "3 weeks", "Deliver a complete analysis from a raw dataset through cleaning, SQL, a dashboard, written recommendations, and reproducible documentation.", ["data-cleaning", "bi-tools", "business-metrics"]),
      topic("data-modeling", "Analytics Data Modeling", "Specialization", "Hard", "2 weeks", "Learn dimensional modeling, metric definitions, and warehouse-friendly tables for reliable self-service analytics.", ["sql", "business-metrics"], [resource("dbt Documentation", "https://docs.getdbt.com/")], "optional"),
    ],
  },
};

const roleMatchers = [
  { slug: "frontend-developer", pattern: /front\s*-?end|frontend|react|web\s*(developer|engineer)|ui\s*(developer|engineer)/i },
  { slug: "data-analyst", pattern: /data\s*analyst|business\s*analyst|business\s*intelligence|\bbi\s*analyst|analytics\s*engineer|product\s*analyst/i },
  { slug: "machine-learning-engineer", pattern: /machine\s*learning|\bml\b|ai\s*(engineer|developer)|data\s*scientist/i },
  { slug: "backend-developer", pattern: /back\s*-?end|backend|node|api\s*(developer|engineer)|server|full\s*stack|software\s*(developer|engineer)|platform\s*engineer/i },
];

export const supportedRoles = Object.values(curricula).map(({ slug, title }) => ({ slug, title }));

export const getCurriculumForRole = (role = "") => {
  const match = roleMatchers.find(({ pattern }) => pattern.test(role.trim()));
  return match ? curricula[match.slug] : null;
};
