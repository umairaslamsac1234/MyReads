import React from 'react';
import * as BooksAPI from './BooksAPI';
import './App.css';
import  BooksCabinet from "./BooksCabinet";
import  BookSearch from "./Book-Search";
import  {Route} from "react-router-dom";

class App extends React.Component {
  state = {

    showSearchPage: false,
    currentlyReading:[],
    wantToRead:[],
    read:[],
    searchResult: []
    
  }
  //fetching data from BooksAPI into books state
      fetchBooksData=()=> {
      BooksAPI.getAll().then(
        (books)=> {
          let wantToRead=[],
          read=[],
          currentlyReading=[];
          books.map((book)=>{ 
            const { shelf } = book; 
              switch (shelf) {
                case 'currentlyReading':
                  currentlyReading.push(book)
                  return null
                case 'wantToRead':
                  wantToRead.push(book)
                  return null
                case 'read':
                  read.push(book)
                  return null
                default:
                  return null
              }
            });
           
            this.setState({
              currentlyReading,
              wantToRead,
              read,
              searchResult:[],
            }
          )
        }
      )
    };

  searchBookRack(bookId) {
    const Books = [...this.state.currentlyReading, ...this.state.wantToRead, ...this.state.read];
    
    let bookInfo = Books.filter((book) => book.id === bookId);

    // if book already at any shelf return shelf name else return 'none'
    return (bookInfo.length !== 0) ? bookInfo[0].shelf : 'none'
  }

  searchBooks = (txtInput) => {  
      (txtInput) ? BooksAPI.search(txtInput)
        .then((books) => {  
          if (books.error) {
            this.setState({
              searchResult: []
            });
            return
          }
          let newBooks = books.map((book) => {
            //assign current shelf to every book
            book.shelf = this.searchBookRack(book.id)
            return book
            
          })
          this.setState({ searchResult: newBooks })
        }): this.setState({ 
        searchResult: []
      })
  }

  shelfChangeHandler = (book, newShelf) => {
    let previousShelf = book.shelf;
    let currentShelfBooksUpdated = (previousShelf !== 'none')
      ? this.state[previousShelf].filter((rec) => rec.id !== book.id)
      : null

    book.shelf = newShelf
    if (newShelf !== 'none' && previousShelf !== 'none') {
      this.setState((prevState) => ({
        [previousShelf]: currentShelfBooksUpdated,
        [newShelf]: [...prevState[newShelf], book],
      }))
    }
    else if (previousShelf === 'none') {
      this.setState((prevState) => ({
        [newShelf]: [...prevState[newShelf], book],
      }))
    }
    else if (newShelf === 'none') {
      this.setState({ [previousShelf]: currentShelfBooksUpdated, })
    }

    BooksAPI.update(book, newShelf)
      .then(() => {
        console.log("Book shelf changed and updated at server")
      })
      .catch((err) => {
        console.log("Error updating shelf", err)

        //  In case of failure response from server following will revert
        //  to prev state because was optimistic updates        

        let currentShelfBooksUpdated = (newShelf !== 'none')
          ? this.state[newShelf].filter((rec) => rec.id !== book.id)
          : null

        book.shelf = previousShelf

        if (newShelf !== 'none' && previousShelf !== 'none') {
          this.setState((prevState) => ({
            [newShelf]: currentShelfBooksUpdated,
            [previousShelf]: [...prevState[previousShelf], book],
          }))
        }
        else if (previousShelf === 'none') {
          this.setState({
            [newShelf]: currentShelfBooksUpdated,
          })
        }
        else if (newShelf === 'none') {
          this.setState((prevState) => ({
            [previousShelf]: [...prevState[previousShelf], book],
          }))
        }
      })
    };

    componentDidMount() {
      this.fetchBooksData();
    }
  
  render() {
    return (
      <div className="app">
              <Route exact path="/" render={() => (
                <BooksCabinet
                  shelfChangeHandler={this.shelfChangeHandler}
                  currentlyReading={this.state.currentlyReading}
                  wantToRead={this.state.wantToRead}
                  read={this.state.read}
                />)}
              />


              <Route exact path="/search" render={() => (
                <BookSearch
                searchBooks={this.searchBooks}
                  searchResult={this.state.searchResult}
                  shelfChangeHandler={this.shelfChangeHandler}
                />)}
              />
            
        }
     
            
          
     </div>) 
  };
};

export default App;
