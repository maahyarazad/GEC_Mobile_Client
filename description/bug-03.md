# Bug 2 – Fix Partner Category Update

## Target File

- `PartnerCategory.tsx`

## Description

1. Review **`PartnerCategory.tsx`**. There is currently no mechanism to edit existing partner categories.
2. The backend already implements an **upsert** mechanism, so the frontend should leverage it to allow administrators to create and update partner categories using the same endpoint.
3. Improve the UI by adding an **Edit** button for each record, allowing administrators to modify a category inline or through a form.
4. Add a **Delete** button for each record to allow administrators to remove partner categories.

```js
updateCategories = async (req, res) => {
  let connection;

  try {
    // Acquire a dedicated connection for the transaction.
    connection = await new Promise((resolve, reject) => {
      db.getConnection((err, conn) => (err ? reject(err) : resolve(conn)));
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      error: err,
      message: "Something wrong with the server",
    });
  }

  // Promisify the connection-bound methods so every statement runs on THIS
  // connection (inside the transaction) and in a well-defined order.
  const beginTransaction = util
    .promisify(connection.beginTransaction)
    .bind(connection);
  const connQuery = util.promisify(connection.query).bind(connection);
  const commit = util.promisify(connection.commit).bind(connection);
  const rollback = util.promisify(connection.rollback).bind(connection);

  try {
    const { update = [], add = [], remove = [] } = req.body;

    await beginTransaction();

    if (update.length > 0) {
      // Bulk upsert existing categories using parameterized values so
      // apostrophes and other special characters can't break the SQL.
      const values = update.map(({ id, pcategory_en, pcategory_de }) => [
        id,
        pcategory_en,
        pcategory_de,
      ]);
      const updateQuery = `
        INSERT INTO app_partner_category (id, pcategory_en, pcategory_de)
        VALUES ?
        ON DUPLICATE KEY UPDATE
          pcategory_en = VALUES(pcategory_en),
          pcategory_de = VALUES(pcategory_de)
      `;
      await connQuery(updateQuery, [values]);
    }

    if (add.length > 0) {
      const values = add.map(({ id, pcategory_en, pcategory_de }) => [
        id,
        pcategory_en,
        pcategory_de,
      ]);
      const addQuery = `
        INSERT INTO app_partner_category (id, pcategory_en, pcategory_de)
        VALUES ?
        ON DUPLICATE KEY UPDATE
          pcategory_en = VALUES(pcategory_en),
          pcategory_de = VALUES(pcategory_de)
      `;
      await connQuery(addQuery, [values]);
    }

    if (remove.length > 0) {
      const ids = remove.map(({ id }) => id);
      const removeQuery = `DELETE FROM app_partner_category WHERE id IN (?)`;
      await connQuery(removeQuery, [ids]);
    }

    await commit();
    res.status(200).send({ success: true });
  } catch (err) {
    console.log(err);
    try {
      await rollback();
    } catch (rollbackErr) {
      console.log(rollbackErr);
    }
    res.status(500).send({
      success: false,
      error: err,
      message: "Something wrong with the Server",
    });
  } finally {
    connection.release();
  }
};
```

## Part 2 


1. use `getAvailableCategoryOffers.txt` file in the root folder to create a new type in the Partner/index.tsx and create new Promise Request to this end point `/category-offer` to get the data 
2. update the **`PartnerCategory.tsx`** and fetch the correct end point 

```js
  //get all partner categories
  const loadCategories = () => {
    PartnerService.getAllCategories()
      .then((result) => {
        setCategoryList(result);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  ```
3. So, rewrite the component entirely, (the category edit, delete, and create remains the same), however the new dataset includes more detailed information, each category contains offers, so add another action that open the offers linked to each category, and then add search inside each modal and use the available resouce to reflect them in UI and also add actions and allow user to remove and more categories to each offer, at the moment we don't have any end point to manage changing the many to many relation so follow the below sql which resulted in the `getAvailableCategoryOffers.txt` and give me the updateCategoriesOffers so I can add the transaction to the server

```sql
SELECT ao.id,
ao.partner_id,
ao.offer_category,
ao.isHotpick,
ao.stock_qty,
ao.prodname_en,
ao.date_created,
ao.avail_count,
ao.status, aoc.category_en , aoc.category_de , aoc.color , aoc.initials , aoc.id  as app_oofer_cat_id, aoa.app
FROM app_offer ao 
LEFT JOIN app_offer_applist aoa ON aoa.offer = ao.id 
LEFT JOIN app_partner_category apc ON apc.id = ao.offer_category 
LEFT JOIN app_offer_categories aoc ON apc.id  = aoc.id 
LEFT JOIN web_partner wp on wp.id = ao.partner_id  
WHERE ao.status = TRUE AND wp.status = '1' 
    AND NOW() BETWEEN wp.time and DATE_ADD(DATE_ADD(wp.time, INTERVAL wp.duration YEAR), INTERVAL 1 MONTH) limit 10;
```


## Part 3

1. I've updated `getAvailableCategoryOffers.txt` file in the root folder update the type in the Partner/index.tsx



## Part 4

## Description

### 1. Data Source

The `getAvailableCategoryOffers.txt` file (located in the root directory) contains data derived from the following SQL query:

```sql
SELECT partner_tag.specialtags_id,
    app_tag.specialtags_en AS en_tag, app_tag.specialtags_de AS de_tag,
    wp.title AS partner_title, wp.id AS partner_id,
    ao.id AS offer_id, ao.prodname_en AS en_offername, ao.prodname_de AS de_offername, ao.avail_count, ao.isHotpick,
    aoc.id AS category_id, aoc.category_en, aoc.category_de
FROM app_partner_specialtags AS partner_tag
    LEFT JOIN app_specialtags app_tag
        ON partner_tag.specialtags_id = app_tag.id
    LEFT JOIN app_partner_applist apa
        ON apa.partner = partner_tag.partner_id
    LEFT JOIN web_partner wp
        ON apa.partner = wp.id
    LEFT JOIN app_offer ao
        ON apa.partner = ao.partner_id
    LEFT JOIN app_offer_categories aoc
        ON ao.offer_category = aoc.id
WHERE apa.app = 2
    AND wp.status = '1'
    AND ao.status = TRUE
    AND NOW() BETWEEN wp.time AND DATE_ADD(wp.time, INTERVAL wp.duration YEAR)
GROUP BY app_tag.id;
```

### 2. Update `PartnerCategory.tsx`

Update the aggregation logic so that data is structured hierarchically, from high level to low level, as follows:

- `category_en`
  - `partner_title`
    - List of tags: `en_tag`, `de_tag`
    - List of offers: `en_offername`, `de_offername`

### 3. UI Behavior

**First Table**
- Displays `category_en`, `category_de`, and the count of partners (as currently implemented).

**Edit Dialog — opened from the first table**
- Opens a new table listing all partners, with the following columns:
  1. `partner_title`
  2. Number of Available Offers *(new column)*
  3. Total Avail in the Past Year *(sum of `avail_count`)*
  4. Actions — Edit / Delete

**Edit Dialog — opened from the partner table's "Edit" action**
- Opens another dialog showing:
  - List of tags: `en_tag`, `de_tag`
  - List of offers: `en_offername`, `de_offername`

### 4. Server-Side Edit/Delete with Rollback

Using the transaction pattern below, implement server-side functions (based on the SQL provided) that allow the operator to edit and delete offers and tags, with rollback support if any step fails.

```js
// Promisify the connection-bound methods so every statement runs on THIS
// connection (inside the transaction) and in a well-defined order.
const beginTransaction = util
  .promisify(connection.beginTransaction)
  .bind(connection);
const connQuery = util.promisify(connection.query).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);
```



## Part 5

## Description

1. Move `{/* Partners dialog */}` section from `PartnerCategory.tsx` ro another component
1. Add the logic to the **`PartnerOffersTagsDialog.tsx`** than operator cannot delete all the tags, and at least one tag should be present
2. following the below sql file add the feature that operator can a new tag and write the transaction end point for server as well

```sql
SELECT partner_tag.specialtags_id,
    app_tag.specialtags_en AS en_tag, app_tag.specialtags_de AS de_tag,
    wp.title AS partner_title, wp.id AS partner_id,
    ao.id AS offer_id, ao.prodname_en AS en_offername, ao.prodname_de AS de_offername, ao.avail_count, ao.isHotpick,
    aoc.id AS category_id, aoc.category_en, aoc.category_de
FROM app_partner_specialtags AS partner_tag
    LEFT JOIN app_specialtags app_tag
        ON partner_tag.specialtags_id = app_tag.id
    LEFT JOIN app_partner_applist apa
        ON apa.partner = partner_tag.partner_id
    LEFT JOIN web_partner wp
        ON apa.partner = wp.id
    LEFT JOIN app_offer ao
        ON apa.partner = ao.partner_id
    LEFT JOIN app_offer_categories aoc
        ON ao.offer_category = aoc.id
WHERE apa.app = 2
    AND wp.status = '1'
    AND ao.status = TRUE
    AND NOW() BETWEEN wp.time AND DATE_ADD(wp.time, INTERVAL wp.duration YEAR)
GROUP BY app_tag.id;
```



## Part 6

## Description

1. From **`PartnerList.tsx`**, the operator can select any partner, which opens the partner details in **`PartnerDetails.tsx`**. Add the partner ID as a query parameter so it can be referenced from other parts of the application.
2. Using the reference from the previous part, add it to **`PartnersDialog.tsx`** so the operator can navigate from this dialog to **`PartnerDetails.tsx`**. Also, add a query parameter for the dialog opening so the user can use the back button to navigate back to the dialog.
