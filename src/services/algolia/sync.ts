import { QueryService } from "../firebase/db/QueryService";

import { client } from ".";

const syncQueries = async () => {
  try {
    const allQueries = await QueryService.findAll(1, 1000);

    if (!allQueries.success || allQueries.data.page_items.length === 0) {
      return;
    }

    const recordsToIndex = allQueries.data.page_items.map(query => ({
      objectID: query.id,
      title: query.title,
      description: query.description,
      creator: query.creator,
      tags: query.tags,
      stars: query.stars,
      forks: query.forks,
      createdAt: query.createdAt,
    }));

    await client.saveObjects({
      indexName: "queries_index",
      objects: recordsToIndex,
    });

    console.log("✅ Successfully synced queries to Algolia!");
  } catch (error) {
    console.error("❌ Error syncing to Algolia:", error);
  }
};

syncQueries();
