/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

// This test ensures that tags changes are correctly live-updated in a history
// query.

let timeInMicroseconds = PlacesUtils.toPRTime(Date.now() - 10000);

function newTimeInMicroseconds() {
  timeInMicroseconds = timeInMicroseconds + 1000;
  return timeInMicroseconds;
}

var gTestData = [
  {
    isVisit: true,
    uri: "http://example.com/1/",
    lastVisit: newTimeInMicroseconds(),
    isInQuery: true,
    isBookmark: true,
    parentGuid: PlacesUtils.bookmarks.unfiledGuid,
    index: PlacesUtils.bookmarks.DEFAULT_INDEX,
    title: "example1",
  },
  {
    isVisit: true,
    uri: "http://example.com/2/",
    lastVisit: newTimeInMicroseconds(),
    isInQuery: true,
    isBookmark: true,
    parentGuid: PlacesUtils.bookmarks.unfiledGuid,
    index: PlacesUtils.bookmarks.DEFAULT_INDEX,
    title: "example2",
  },
  {
    isVisit: true,
    uri: "http://example.com/3/",
    lastVisit: newTimeInMicroseconds(),
    isInQuery: true,
    isBookmark: true,
    parentGuid: PlacesUtils.bookmarks.unfiledGuid,
    index: PlacesUtils.bookmarks.DEFAULT_INDEX,
    title: "example3",
  },
];

function newQueryWithOptions() {
  return [
    PlacesUtils.history.getNewQuery(),
    PlacesUtils.history.getNewQueryOptions(),
  ];
}

function testQueryContents(aQuery, aOptions, aCallback) {
  let root = PlacesUtils.history.executeQuery(aQuery, aOptions).root;
  root.containerOpen = true;
  aCallback(root);
  root.containerOpen = false;
}

add_task(async function test_initialize() {
  await task_populateDB(gTestData);
});

add_task(function pages_query() {
  let [query, options] = newQueryWithOptions();
  options.queryType = Ci.nsINavHistoryQueryOptions.QUERY_TYPE_BOOKMARKS;
  testQueryContents(query, options, function (root) {
    compareArrayToResult([gTestData[0], gTestData[1], gTestData[2]], root);
    for (let i = 0; i < root.childCount; i++) {
      let node = root.getChild(i);
      let uri = NetUtil.newURI(node.uri);
      Assert.equal(node.tags, null);
      PlacesUtils.tagging.tagURI(uri, ["test-tag"]);
      Assert.equal(node.tags, "test-tag");
      PlacesUtils.tagging.untagURI(uri, ["test-tag"]);
      Assert.equal(node.tags, null);
    }
  });
});

add_task(function visits_query() {
  let [query, options] = newQueryWithOptions();
  options.queryType = Ci.nsINavHistoryQueryOptions.QUERY_TYPE_BOOKMARKS;
  options.resultType = Ci.nsINavHistoryQueryOptions.RESULTS_AS_VISIT;
  testQueryContents(query, options, function (root) {
    compareArrayToResult([gTestData[0], gTestData[1], gTestData[2]], root);
    for (let i = 0; i < root.childCount; i++) {
      let node = root.getChild(i);
      let uri = NetUtil.newURI(node.uri);
      Assert.equal(node.tags, null);
      PlacesUtils.tagging.tagURI(uri, ["test-tag"]);
      Assert.equal(node.tags, "test-tag");
      PlacesUtils.tagging.untagURI(uri, ["test-tag"]);
      Assert.equal(node.tags, null);
    }
  });
});

add_task(function bookmark_parent_query() {
  let [query, options] = newQueryWithOptions();
  query.setParents([PlacesUtils.bookmarks.unfiledGuid]);
  testQueryContents(query, options, function (root) {
    compareArrayToResult([gTestData[0], gTestData[1], gTestData[2]], root);
    for (let i = 0; i < root.childCount; i++) {
      let node = root.getChild(i);
      let uri = NetUtil.newURI(node.uri);
      Assert.equal(node.tags, null);
      PlacesUtils.tagging.tagURI(uri, ["test-tag"]);
      Assert.equal(node.tags, "test-tag");
      PlacesUtils.tagging.untagURI(uri, ["test-tag"]);
      Assert.equal(node.tags, null);
    }
  });
});

add_task(function history_query() {
  let [query, options] = newQueryWithOptions();
  testQueryContents(query, options, function (root) {
    compareArrayToResult([gTestData[0], gTestData[1], gTestData[2]], root);
    for (let i = 0; i < root.childCount; i++) {
      let node = root.getChild(i);
      let uri = NetUtil.newURI(node.uri);
      Assert.equal(node.tags, null);
      PlacesUtils.tagging.tagURI(uri, ["test-tag"]);
      Assert.equal(node.tags, null);
      PlacesUtils.tagging.untagURI(uri, ["test-tag"]);
      Assert.equal(node.tags, null);
    }
  });
});