import { algoliasearch } from "algoliasearch";

const client = algoliasearch("YourAppID", "YourAdminAPIKey");
const index = client.addOrUpdateObject("queries");

export { index };
