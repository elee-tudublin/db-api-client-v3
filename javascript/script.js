
// The set HTTP headers. These will be used by Fetch when making requests to the api
const HTTP_REQ_HEADERS = new Headers({
    "Accept": "application/json",
    "Content-Type": "application/json"
  });

// Requests will use the GET method and permit cross origin requests
const GET_INIT = { method: 'GET', credentials: 'include', headers: HTTP_REQ_HEADERS, mode: 'cors', cache: 'default' };

// API Base URL - the server address
const BASE_URL = `http://localhost:8080`;


// Asynchronous Function getDataAsync from a url and return
async function getDataAsync(url) {
    // Try catch 
    try {
      // Call fetch and await the respose
      // Initally returns a promise
      const response = await fetch(url, GET_INIT);
  
      // As Resonse is dependant on fetch, await must also be used here
      const json = await response.json();
  
      // Output result to console (for testing purposes) 
      console.log(json);
  
      // Call function( passing he json result) to display data in HTML page
      //displayData(json);
      return json;
  
      // catch and log any errors
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  
// Parse JSON
// Create product rows
// Display in web page
function displayProducts(products) {
    // Use the Array map method to iterate through the array of products (in json format)
    // Each products will be formated as HTML table rowsand added to the array
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
    // Finally the output array is inserted as the content into the <tbody id="productRows"> element.
  
    const rows = products.map(product => {
      // returns a template string for each product, values are inserted using ${ }
      // <tr> is a table row and <td> a table division represents a column
  
        let row = `<tr>
                <td>${product.ProductId}</td>
                <td>${product.ProductName}</td>
                <td>${product.ProductDescription}</td>
                <td>${product.ProductStock}</td>
                <td class="price">&euro;${Number(product.ProductPrice).toFixed(2)}</td>
                <td><button class="btn btn-xs" data-toggle="modal" data-target="#ProductFormDialog" onclick="prepareProductUpdate(${product.ProductId})"><span class="oi oi-pencil"></span></button></td>
                <td><button class="btn btn-xs" onclick="deleteProduct(${product.ProductId})"><span class="oi oi-trash"></span></button></td>
                </tr>`;

        return row;       
    });
    // Set the innerHTML of the productRows root element = rows
    // Why use join('') ???
    document.getElementById('productRows').innerHTML = rows.join('');
} // end function


// load and display categories in thhe left menu
function displayCategories(categories) {
  //console.log(categories);

  // Cat menu

  // use Array.map() to iterate through the list of categories
  // Returns an HTML link for each category in the array
  const catLinks = categories.map(category => {
    // The link has an onclick handler which will call updateProductsView(id) pasing the category id as a parameter
    return `<a href="#" class="list-group-item list-group-item-action" onclick="updateProductsView(${category.CategoryId})">${category.CategoryName}</a>`;
  });

  // use  unshift to add a 'Show all' link at the start of the array of catLinks
  catLinks.unshift(`<a href="#" class="list-group-item list-group-item-action" onclick="loadProducts()">Show all</a>`);

  // Set the innerHTML of the productRows element = the links contained in catlinks
  // .join('') converts an array to a string, replacing the , seperator with blank.
  document.getElementById('categoryList').innerHTML = catLinks.join('');

  // *** Fill select list in product form ***
  // first get the select input by its id
  let catSelect = document.getElementById("CategoryId");

  // Add default option (to the currently empty select)
  // options[catSelect.options.length] is the last option + 1
  // an option is made from a name, value pair
  catSelect.options[catSelect.options.length] = new Option('Choose Category', '0');

  // Add an option for each category
  // iterate through categories adding each to the end of the options list
  // each option is made from categoryName, categoryId
  for (i=0; i< categories.length; i++) {
    catSelect.options[catSelect.options.length] = new Option(categories[i].CategoryName, categories[i].CategoryId);
  }

} // end function


// Load Products
// Get all categories and products then display
async function loadProducts() {
  try {
    
    // Get a list of categories via the getDataAsync(url) function
    const categories = await getDataAsync(`${BASE_URL}/category`);
    // Call displaycategoriess(), passing the retrieved categories list
    displayCategories(categories);

    // Get a list of products
    const products = await getDataAsync(`${BASE_URL}/product`);
    // Call displayProducts(), passing the retrieved products list
    displayProducts(products);

  } // catch and log any errors
      catch (err) {
      console.log(err);
  }
}

// update products list when category is selected to show only products from that category
async function updateProductsView(id) {
  try {
    // call the API enpoint which retrieves products by category (id)
    const products = await getDataAsync(`${BASE_URL}/product/bycat/${id}`);
    // Display the list of products returned by the API
    displayProducts(products);

  } // catch and log any errors
  catch (err) {
    console.log(err);
  }
}


// Get form data and return as json ready for POST
// Uppercase first char to match DB
function getProductForm() {

  // Get form fields
  const pId = document.getElementById('ProductId').value;
  const catId = document.getElementById('CategoryId').value;
  const pName = document.getElementById('ProductName').value;
  const pDesc = document.getElementById('ProductDescription').value;
  const pStock = document.getElementById('ProductStock').value;
  const pPrice = document.getElementById('ProductPrice').value;

  // build request body for post
  // JSON.stringify converts the object to json
  // required for sending to the API
  const productJson = JSON.stringify({
  ProductId: pId,
  CategoryId: catId,
  ProductName: pName,
  ProductDescription: pDesc,
  ProductStock: pStock,
  ProductPrice: pPrice
  });

  // return the body data
  return productJson;
}

// Add a new product - called by form submit
// get the form data and send request to the API
async function addProduct() {
  // url for api call
  const url = `${BASE_URL}/product`
  // get new product data as json (the request body)
  const reqBodyJson = getProductForm();
  
  // build the request object - note: POST
  // reqBodyJson added to the req body
  const request = {
      method: 'POST',
      headers: HTTP_REQ_HEADERS,
      // credentials: 'include',
      mode: 'cors',
      body: reqBodyJson
    };

  // Try catch 
  try {
    // Call fetch and await the respose
    // fetch url using request object
    const response = await fetch(url, request);
    const json = await response.json();

    // Output result to console (for testing purposes) 
    console.log(json);

    // catch and log any errors
  } catch (err) {
    console.log(err);
    return err;
  }
  // Refresh products list
  loadProducts();
}

  // When a product is selected for update/ editing, get it by id and fill out the form
  async function prepareProductUpdate(id) {

    try {
        // Get broduct by id
        const product = await getDataAsync(`${BASE_URL}product/${id}`);
        // Fill out the form
        document.getElementById('ProductId').value = product.ProductId; // uses a hidden field - see the form
        document.getElementById('CategoryId').value = product.CategoryId;
        document.getElementById('ProductName').value = product.ProductName;
        document.getElementById('ProductDescription').value = product.ProductDescription;
        document.getElementById('ProductStock').value = product.ProductStock;
        document.getElementById('ProductPrice').value = product.ProductPrice;
    } // catch and log any errors
    catch (err) {
    console.log(err);
    }
  }

  // Delete product by id using an HTTP DELETE request
  async function deleteProduct(id) {

    const request = {
      method: 'DELETE',
      headers: HTTP_REQ_HEADERS,
      // credentials: 'include',
      mode: 'cors',
    };
        
    if (confirm("Are you sure?")) {
        // url
        const url = `${BASE_URL}/product/${id}`;
        
        // Try catch 
        try {
            const result = await fetch(url, request);
            const response = await result.json();

            if (response == true)
              loadProducts();

        // catch and log any errors
        } catch (err) {
            console.log(err);
            return err;
        }
    }
  }


// Alternative for getting for data
// used formData object
// https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData
function getProductFormAlt() {

  // Get form + data
  const productForm = document.getElementById("productForm");
  const formData = new FormData(productForm);

  // https://stackoverflow.com/questions/41431322/how-to-convert-formdatahtml5-object-to-json
  // Get form fields + values
  let newProduct = {};
  formData.forEach((value, key) => newProduct[key] = value);

  // return product json
  return JSON.stringify(newProduct);
}



// When this script is loaded, call loadProducts() to add products to the page
loadProducts();