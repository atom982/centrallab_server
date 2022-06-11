var privateKey = "-----BEGIN PRIVATE KEY-----\n" +
  "MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDInJFbdsDWXlsc\n" +
  "80r47Od9fyqO0l45HGKpIX8FFdiG2vXH0pFp3UdMjHhXgtNZRhNq30/izEZV5nCe\n" +
  "lpb2nMY1doQe6fdI9GEqNaqvl6zKMc0753zXX+MLQU5QD2+gJ4kQ1Y6/s/a48yLU\n" +
  "v4PQAgZR2o1kTG4V7v26PDSpKuo3DdQAtKfAHWzZI7uWa2BuR4SYy5Rryq7XhM/b\n" +
  "vX0sWbay4EKB8jCUi7BKzKYfmloa0M8N639w1aYyzQPAztEx81T8s09ZfS7XiLXk\n" +
  "w/SkBPAcnsXIJGhVioIvSJkkH7c8f1aryHiPln4GYKA1rOYaAspBRiuGWAjvAjQs\n" +
  "TxIIiY+fAgMBAAECggEAaj4g7SOTNPR7pHVkuzgb0ObMDx9yLyTNS20l6/eJ2MGV\n" +
  "cOIfiMVbwTqTcSUj8R+foPXrRN2SUmPcOODfynN0tVOy3PxjrgteehA5+QyGwf5m\n" +
  "Btet0hJCF+/aHaRPJa5KdNPk6bnRbFm3lJxonny0BB2OzBN+KbeMQFkqOn0z1TtZ\n" +
  "FwYM2daAcp/fC+JfnQeYAGJt8nfLQfVwMvG+lJyI4cksCdQKsaEix67YsAy4n5Dy\n" +
  "9zlqguHw/qQWEVbRWWcacYdFgL8LzITLz48A/6/2YJrIEXC/HOVpN2YhN2iiW5fl\n" +
  "UXPzgSDom1PvOOVM4FuvfjClbXq91KGGcbFoOhwSwQKBgQDwqufZqk9zE0mee1U+\n" +
  "wl0KhExuUSasxY00iNa+PrUl9ndF/9+LwP+DqAIPI3PXjnvQyqkJZ+tjwwRdyHlL\n" +
  "gWz+I2uWS4aOzoukVkPgfwvRaF/CHfjO72A6t9Y+6qau64lOiIIqBMa6LkalFcjl\n" +
  "52zAtqe2PR9t4oT1m+in0+PBhwKBgQDVZGGIMVX/mzAae1hev2xm2BXkt9nPMY9i\n" +
  "nZ5sCUOx8Ib6TX9UgY8msx/K466LbTHG8VsN07eh/lXvL8sw5T5pUCpu6aQKmqvf\n" +
  "hDZgGHTmhpEHSsAsdfmc19a307tXxFTv59h9D5pSX23XCTLhJd2zrE+KKJ5lpwg9\n" +
  "vmWTGcwnKQKBgQC5sqWDBi6XlGJRrshvzHkODFcNKAC3fxcdWhiYYrpTuID/uhc7\n" +
  "NofxhklQdQKFaKOQz07uuwidyXQtCOrOn+cBkUMKjOwedLC69PUa2+y6f9ajaYz5\n" +
  "3ypZJFBj65sBjSw9NId69ISCVAKejticzJzVdhqiOzdtCkOdX9d857ntMQKBgQCG\n" +
  "riNMhO7lM3opzJ2atzBgvJMc1ti2h24a7KY3Q6WhIdDfG5h4qojCAR3YvNjGEPXw\n" +
  "vRYd5PkqWc689qpEwvsgFsOhWv743mQJ33U+M1FcyaOxOYGOzirrzeIsBYthOn3t\n" +
  "KKQfUoCw6p/1r02YgoCpzOAqr7ZBLCnsZkXPkOGj+QKBgQCbMm+pEHBsLoP26lqy\n" +
  "AP+tW0eBx7XTSoB2LEILGa2bhlE1RpAu/DDPxcEaZ3aYtx8VtxpCRRk+SPei1ZXZ\n" +
  "mD42sA2mIKIDPMeB96FCU6Sy2tNUzRO34tr0NwbpCiOBRexoPS1XzXYNt+saKNFM\n" +
  "6y0apsU9V4Mb+FuowRn2IW9OCw==\n" +
  "-----END PRIVATE KEY-----\n";

qz.security.setSignaturePromise(function (toSign) {
  return function (resolve, reject) {
    try {
      var pk = KEYUTIL.getKey(privateKey)
      var sig = new KJUR.crypto.Signature({ "alg": "SHA1withRSA" })
      sig.init(pk)
      sig.updateString(toSign)
      var hex = sig.sign()
      console.log("DEBUG: \n\n" + stob64(hextorstr(hex)))
      resolve(stob64(hextorstr(hex)))
    } catch (err) {
      console.error(err)
      reject(err)
    }
  }
})
