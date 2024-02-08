<h1 align="center">Trello Alternative</h1>

<h3>Trello Alternative is an Clone App of Trello.</h3>
<p>Trello Alternative is an app inspired totally by Trello, contains multiple features: </p>
<ul>
  <li>User authentication: Get a JSON Web Token, Refresh that token (Using cookies)</li>
  <li>Workspace creation: You can divide your work into pieces and create a workspace for each one, by default once you sign up, you will get your private Workspace. </li>
  <li>Board creation: As Trello, inside the workspace, you can define a board for a specific Project. For Example: Programming</li>
  <li>List creation: These are created inside the boards. For Example: List: "Personal Projects" inside PROGRAMMING Board</li>
  <li>Card creation: Cards exist inside Lists and these are the most important, because there you can upload attachments, add members, add tasks, and manage each project you have. For Example: Card "Trello Clone" inside PERSONAL PROJECTS List</li>
  <li>Attachments: This App was made to store information not locally, instead it is using <strong>Google Cloud Storage</strong>,so we don't have to worry about the space, but can have everything stored in the cloud</li>
</ul>

Important dependencies: 
- @google-cloud/storage
- cookie-parser
- class-validator
- passport
- jsonwebtoken
- bcrypt

<div align="center">
  <p>Download Postman workspace to test</p>
<a href="https://www.postman.com/red-sunset-304499/workspace/trello-alternative">Postman API Documentation</a>

<p>Status: <strong>FINISHED</strong></p>
</div>

<section>
  <h3>Key things to start the project using NESTJS</h3>
  <p>If you're planning to start a new project, then you can simply run:</p>
  
  ````
  npm i -g @nestjs/cli
  nest new <Project-name>
  ````

  <p>To install the dependencies of this one and run the project</p>
  
  ````
  npm install
  npm run start:dev
  ````

  <p>For more information, check NestJS documentation: <a href="https://docs.nestjs.com/">https://docs.nestjs.com/</a></p>

  _Note: as this is not running LIVE, you must create your OWN .env file to handle your environment variables._
  <h5>.ENV structure:</h5>
  
  ````
  DB_QUERY = Include your MongoDB Query String
  ACCESS_TOKEN = This is a random string created
  REFRESH_TOKEN = This is a random string created, not the same as ACCESS_TOKEN
  ACCESS_TOKEN_DURATION = Duration of the AT, for example: 30s, 30m, 24h, 1d
  REFRESH_TOKEN_DURATION = Duration of the RT, for example: 30s, 30m, 24h, 1d, MAKE SURE TO BE BIGGER THAN AT DURATION

  The next 4 variables are obtained from Google Cloud Platform, KEEP THEM SECRET

  PROJECT_ID = This is your project ID from GCP
  CLIENT_EMAIL = Not your email address, but the email you specify in your project
  BUCKET = The name of the bucket you created before
  PRIVATE_KEY = This is the Private Key you receive when generating it, make sure to copy from -----BEGIN UNTIL END PRIVATE KEY-----\n
  ````

  If you would like to know how to integrate GCP in the project
  <ol>
    <li>Start a plan, go to <a href="https://cloud.google.com/gcp?utm_source=google&utm_medium=cpc&utm_campaign=emea-pl-all-en-bkws-all-all-trial-e-gcp-1707574&utm_content=text-ad-none-any-DEV_c-CRE_500236788864-ADGP_Hybrid+%7C+BKWS+-+EXA+%7C+Txt+-+GCP+-+General+-+v3-KWID_43700060393215914-kwd-26415313501-userloc_9048059&utm_term=KW_google+cloud+platform-NET_g-PLAC_&&gad_source=1&gclid=CjwKCAiAlJKuBhAdEiwAnZb7lYL_bxTEeuB3NW4X64w3Lj8kyA7CM16owPOBDquc1Ob8InO0NyBXTBoCo24QAvD_BwE&gclsrc=aw.ds&hl=en"></a></li>
    <li>Create a Project with any name</li>
  </ol>


</section>

