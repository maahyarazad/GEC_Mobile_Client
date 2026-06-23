# Bug 2: Browser Refresh Does Not Work

## Target Files

- `.htaccess`
- `index.php`

## Description

When refreshing the following pages, the rewrite rules do not work correctly. This application is hosted on top of a legacy PHP application.

- https://www.german-emirates-club.com/admin/application
- https://www.german-emirates-club.com/admin/application/push-notification


# Bug 3: Browser Refresh on Subpaths Does Not Work

## Target Files

* `.htaccess`
* `index.php`

## Description

The application base route is working correctly; however, browser refresh does not work for nested routes. The rewrite rules are not catching requests for subpaths.

Affected URLs:

* https://www.german-emirates-club.com/admin/application/*
* https://www.german-emirates-club.com/admin/application/push-notification

### Expected Result

Refreshing the browser on any application route should load the page correctly and route the request through the application's entry point.

### Actual Result

Refreshing the browser on nested routes results in an error because the rewrite rules do not handle subpath requests correctly.
