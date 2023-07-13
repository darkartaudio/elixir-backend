const app = require('../app');
const request = require('supertest');
const expect = require('chai').expect;
const { describe, it} = require('mocha');

const { faker } = require('@faker-js/faker')

// describe('GET /recipes', () => {
//     it('should return a 200 response', (done) => {
//         request(app).get('/recipes')
//             .expect(200, done);
//     });
//     it('should return a recipe with a name', (done) => {
//         request(app).get('/recipes')
//             .then(result => {
//                 console.log('result', result._body.recipes[0]);
//                 expect(result._body.recipes[0]).to.have.property('name');
//                 done();
//             });
//     });
//     it('should have more than 1 recipes', (done) => {
//         request(app).get('/recipes')
//             .then(result => {
//                 expect(result._body.recipes.length).to.be.above(1);
//                 done();
//             });
//     });
// });

// describe('POST to /recipes/new', () => {    
//     it('should create a new recipe and have a valid name', (done) => {
//         let name = faker.person.firstName();
//         request(app).post('/recipes/new')
//             .type('form')
//             .send({
//                 name: name,
//                 instructions: 'add 1 sip',
//                 category: 'Cocktail',
//                 glassType: 'Martini Class',
    
//             })
//             .then(response => {
//                 console.log('new airline created', response._body)
//                 expect(response._body.recipe.name).to.be.equal(name)
//                 done();
//             })
//             .catch(error=> {
//                 console.log('error', error);
//                 throw error;
//             })
//     });

//     it('returns a 200 response', (done) => {
//         let name = faker.person.firstName();
//         request(app).post('/recipes/new')
//         .type('form')
//         .send({
//                 name: name,
//                 instructions: 'add 1 sip',
//                 category: 'Cocktail',
//                 glassType: 'Martini Class',
//         })
//         .expect(200, done);
//     })
// });

// describe('PUT to /recipes/:id', () => {
//     it('should update an recipe and have a valid name', (done) => {
//         let name = faker.person.firstName()
//         request(app).post('/recipes/new')
//             .type('form')
//             .send({
//                 name: name,
//                 instructions: 'add 1 sip',
//                 category: 'Cocktail',
//                 glassType: 'Martini Glass'
//             })
//             .then(response => {
//                 console.log('new recipe created', response._body)
//                 const recipeId = response._body.recipe._id;
//                 let randomName = faker.person.firstName()
//                 request(app).put(`/recipes/${recipeId}`)
//                 .type('form')
//                 .send({ name: randomName })
//                 .then(updatedRecipe => {
//                     expect(updatedRecipe._body.recipe.name).to.be.equal(randomName)
//                     done();
//                 })
//             })
//             .catch(error=> {
//                 console.log('error', error);
//                 throw error;
//             })
//     });

//     it('returns a 200 response', (done) => {
//         let name = faker.person.firstName()
//         request(app).post('/recipes/new')
//             .type('form')
//             .send({
//                 name: name,
//                 instructions: 'add 1 sip',
//                 category: 'Cocktail',
//                 glassType: 'Martini Glass'
//             })
//             .then(response => {
//                 console.log('new airline created', response._body)
//                 const recipeId = response._body.recipe._id;
//                 let randomName = faker.person.firstName()
//                 request(app).put(`/recipes/${recipeId}`)
//                 .type('form')
//                 .send({ recipe: randomName })
//                 .expect(200, done);
//             })
//             .catch(error=> {
//                 console.log('error', error);
//                 throw error;
//             })
//     })
// })

// describe('DELETE /recipes/:id', ()=> {
//     it('should delete an recipe and return a 200 response', (done) => {
//     let name = faker.person.firstName()
//     request(app).post('/recipes/new')
//             .type('form')
//             .send({
//                 name: name,
//                 instructions: 'add 1 sip',
//                 category: 'Cocktail',
//                 glassType: 'Martini Glass'
//             })
//             .then(response => {
//                 console.log('new recipe created', response._body)
//                 const recipeId = response._body.recipe._id;
//                 request(app).delete(`/recipes/${recipeId}`)
//                 .expect(200, done);
//             })
//             .catch(error=> {
//                 console.log('error', error);
//                 throw error;
//             })
// })
// })
