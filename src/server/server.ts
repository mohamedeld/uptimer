import http from "http";
import cors from "cors";
import {
  Express,
  NextFunction,
  Request,
  Response,
  json,
  urlencoded,
} from "express";
import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { expressMiddleware } from "@apollo/server/express4";
import cookieSession from "cookie-session";
import { mergedGQLSchema } from "@app/graphql/schema";

const typeDefs = `#graphql 
    type User{
        username: String
    }
    type Query{
        user: User
    }
`;

const resolvers = {
  Query: {
    user() {
      return {
        username: "mohamed",
      };
    },
  },
};

export default class MonitorServer {
  private app: Express;
  private httpServer: http.Server;
  private server: ApolloServer;

  constructor(app: Express) {
    this.app = app;
    this.httpServer = new http.Server(app);
    const schema = makeExecutableSchema({
      typeDefs: mergedGQLSchema,
      resolvers,
    });
    this.server = new ApolloServer({
      schema,
      introspection: process.env.NODE_ENV !== "production",
      plugins: [
        ApolloServerPluginDrainHttpServer({
          httpServer: this.httpServer,
        }),
        process.env.NODE_ENV === "production"
          ? ApolloServerPluginLandingPageDisabled()
          : ApolloServerPluginLandingPageLocalDefault({
              embed: true,
            }),
      ],
    });
  }

  async start(): Promise<void> {
    await this.server.start();
    this.standardMiddleware(this.app);
    this.startServer();
  }

  private healthRoute(app: Express): void {
    app.get("/health", (_req: Request, res: Response) => {
      res.status(200).send("Uptimer mointor service is healthy and ok.");
    });
  }

  private graphqlRoute(app: Express): void {
    app.use(
      "/graphql",
      cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
      }),
      json({ limit: "200mb" }),
      urlencoded({ extended: true, limit: "200mb" }),
      expressMiddleware(this.server, {
        context: async ({ req, res }: { req: Request; res: Response }) => ({
          req,
          res,
        }),
      }),
    );
  }

  private standardMiddleware(app: Express): void {
    app.set("trust proxy", 1);
    app.use((_req: Request, res: Response, next: NextFunction) => {
      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
      next();
    });
    app.use(
      cookieSession({
        name: "session",
        keys: [
          process.env.SECRET_KEY_ONE as string,
          process.env.SECRET_KEY_TWO as string,
        ],
        maxAge: 24 * 7 * 3600000,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "lax",
      }),
    );
    this.graphqlRoute(app);
    this.healthRoute(app);
  }

  private async startServer(): Promise<void> {
    try {
      const SERVER_PORT: number = parseInt(process.env.PORT as string) || 5000;
      this.httpServer.listen(SERVER_PORT, () => {
        console.log(`Server running on port ${SERVER_PORT}`);
      });
    } catch (error) {
      console.log(error);
    }
  }
}
