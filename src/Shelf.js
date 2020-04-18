import React from 'react'
import BookInRack from './BookInRack'


function Shelf(props) {
    
    const { shelfChangeHandler, books, shelf } = props
    
    return (
        <div className="bookshelf">
            <h2 className="bookshelf-title">{shelf}</h2>
            <BookInRack shelfChangeHandler={shelfChangeHandler} books={books} />
        </div>
    );
}

export default Shelf;