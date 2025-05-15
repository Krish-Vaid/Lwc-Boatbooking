public with sharing class HttpExample {
    public static void testHttpExample() {
        Http h = new Http();
        HttpRequest req = new HttpRequest ();
        req.setEndPoint('https://jsonplaceholder.typicode.com/posts');
        req.setMethod('GET');

        HttpResponse res = h.send(req);
        if (res.getStatusCode() == 200) {
            System.debug('Response Body: ' + res.getBody());
        } else {
            System.debug('Error occurred. Status Code: ' + res.getStatusCode());
            System.debug('Error Response: ' + res.getBody());
        }
    }
    public static void testHttpPut(){
        Http h1 = new Http();
        HttpRequest requ = new HttpRequest ();
        requ.setEndPoint('https://jsonplaceholder.typicode.com/posts');
        requ.setMethod('PUT');
        String body = '{"id": 1, "title": "Updated Title", "body": "Updated body content.", "userId": 1}';
        requ.setBody(body);

        
        requ.setHeader('Content-Type', 'application/json');

        HttpResponse res = h1.send(requ);
        if (res.getStatusCode() == 200) {
            System.debug('Response Body: ' + res.getBody());
        } else {
            System.debug('Error occurred. Status Code: ' + res.getStatusCode());
            System.debug('Error Response: ' + res.getBody());
        }

    }
}