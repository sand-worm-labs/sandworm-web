import { db } from "@/services/firebase/db";
import { index as algoliaIndex } from "@/services/algolia";

// Adjust this based on how many you expect to fetch
const backfillAlgolia = async () => {
  try {
    const allQueries = await db.querys.get();

    if (allQueries.length === 0) {
      console.log("No queries to backfill.");
      return;
    }

    const algoliaFormatted = allQueries.map(doc => {
      const data = doc.data;

      return {
        objectID: doc.ref.id,
        title: data.title,
        description: data.description,
        creator: data.creator,
        query: data.query,
        tags: data.tags,
        stars: data.stars,
        forks: data.forks,
        forked: data.forked,
        private: data.private,
        createdAt: new Date(), // Or: new Date(data.createdAt.toMillis())
        updatedAt: new Date(),
      };
    });

    await algoliaIndex.saveObjects(algoliaFormatted);

    console.log("✅ Successfully backfilled Algolia.");
  } catch (error) {
    console.error("❌ Error backfilling Algolia:", error);
  }
};

backfillAlgolia();
