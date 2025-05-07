import { algoliasearch } from "algoliasearch";

const client = algoliasearch("YourAppID", "YourAdminAPIKey");
const index = client.ind("queries");

export { index };
