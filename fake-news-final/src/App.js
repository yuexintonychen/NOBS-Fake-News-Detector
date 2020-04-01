import React, { Component } from 'react';
import './App.css';
import {Form} from 'react-bootstrap';
import { ReactComponent as Logo } from './NOBS Web Logo.svg';
import ArticleRow from './ArticleRow';
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('9e3ac01f44214b3e8f0bcf5c572dc0de');





class App extends Component {
  constructor(props ){
    super(props)
    this.state = {rows: [], value: '', stats: []};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

  }

performSearch(query){
  console.log('Perform search')
  newsapi.v2.everything({
    q:query,
  }).then(response => {
    var articleRows = [];
    var id = 0;
    const articles = Object.values(response.articles);
    articles.forEach(art => {
      var article = Object.values(art);
      article.shift();
      fetch("http://localhost:7777/detector?h=" + article[2] )
            .then(response => {
              response.json()
              .then(data => {
                console.log(data['bool']);
                article.push(data['bool']);
                console.log(Number.parseFloat(data['prob'] * 100).toPrecision(4));
                article.push(Number.parseFloat(data['prob'] * 100).toPrecision(4).toString().concat('%'));
                return article;
              })
                .then(art => {
                  const articleRow = <ArticleRow article={art} key={id}></ArticleRow>
                  console.log(articleRow);
                  articleRows.push(articleRow);
                  id++;
                  return articleRow;
                }).then(row =>{
                  //console.log(row);
                  //console.log("State setted");
                  //this.setState({rows: row});
                  this.setState({rows: this.state.rows.concat(row)});
                  //console.log(this.state.rows);
                  });
                });
    });

  }).catch(function (response) {
  });
}


handleChange(event){
  this.setState({value: event.target.value});
  this.forceUpdate();
}

handleSubmit(event){
  //call API here
  console.log("Input is: " + this.state.value);
  if (this.state.value.includes('http')){
    console.log("TRUE");
    var rows = [];
    this.setState({rows: rows});
    this.getArticleData(this.state.value);
    this.forceUpdate();
  }
  else{
    var rows = [];
    this.setState({rows: rows});
    this.performSearch(this.state.value);
    this.forceUpdate();
  }
  event.preventDefault();
}

//First version. Seems to have synchrnous issues, bool and prob are coming out undefined
getArticleData(link){
  //returns in html right now
    var search;
    fetch("https://cors-anywhere.herokuapp.com/"+link)
    .then(response => {
      response.text().then(data => {
      var el = document.createElement('html');
      el.innerHTML=data;
      search = el.getElementsByTagName('title')[0].innerHTML;
      newsapi.v2.everything({
        q:search,})
      .then(response => {
        var articleRows = [];
        var id = 0;
        const articles = Object.values(response.articles);
        articles.forEach(art => {
          var article = Object.values(art);
          article.shift();
          console.log(article[2]);
          fetch("http://localhost:7777/detector?h=" + article[2] )
            .then(response => {
              response.json()
              .then(data => {
                console.log(data['bool']);
                article.push(data['bool']);
                console.log(Number.parseFloat(data['prob'] * 100).toPrecision(4));
                article.push(Number.parseFloat(data['prob'] * 100).toPrecision(4).toString().concat('%'));
                return article;
              })
                .then(art => {
                  const articleRow = <ArticleRow article={art} key={id}></ArticleRow>
                  console.log(articleRow);
                  articleRows.push(articleRow);
                  id++;
                  return articleRow;
                }).then(row =>{
                  //console.log(row);
                  //console.log("State setted");
                  //this.setState({rows: row});
                  this.setState({rows: this.state.rows.concat(row)});
                  //console.log(this.state.rows);
                  });
                });
        });

      });
    });
  });
}


    render() {
      return (
          <div className="background">
            <table className='App-header' style={{width:'100%',margin:'0 auto'}}>
              <tbody>
                <tr>
                  <td><Logo className="App-logo"></Logo></td>
                  <td><h3>News Search & Fake News Detector</h3></td>
                </tr>
              </tbody>
            </table>
            <Form style={{width:'45%',margin:'0 auto',textAlign:'center'}} onSubmit={this.handleSubmit}>
              <input value={this.state.value} onChange={this.handleChange} style={{fontSize: '110%', display:'block', margin: '0px', width:'99%', paddingTop:"8px", paddingBottom:"8px", paddingLeft:"8px", contentAlign:"center"}} type="text" placeholder="Enter article URL or keywords"/>
              <input className="search-button" type="submit" style={{fontSize: '95%', fontWeight: 'bold'}} value="Submit"/>
            </Form>
            <Form style={{width:'100%',margin:'3px',textAlign:'center'}}> <a className="search-button" href="https://etherscan.io/tx/0x2d6a7b0f6adeff38423d4c62cd8b6ccb708ddad85da5d3d06756ad4d8a04a6a2" target="_blank"> View in Blockchain </a> </Form>
            {this.state.rows}
          </div>
      );
    }
}

export default App;
