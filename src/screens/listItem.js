import React from 'react';

//import { MaterialIcons } from '@expo/vector-icons'

export default function ListItem(props) {
    const color = getColor(props.item.clutter);
    const handleEdit = (key) => {props.handleEdit(key)}
    const handleDelete = (key) => {props.handleDelete(key)}
    return (
    <div className={`listContainer ${color}`}>
        <div>
          <img className='listItemPhoto' src={props.item.image}/>
        </div>
        <div className='listItemContainer'>
          <p className='listItemText1'>Location: {props.item.location}</p>
          <p className='listItemText1'>Type: {props.item.room_type}</p>
          <p className={`listItemText1`}>Rating: <span className={`listItemText1`}>{props.item.clutter}</span></p>
          <p className='listItemText1'>Upload Date: {props.item.date_created}</p>
          <div className="listItemText1 spacing" onClick={() => handleEdit(props.item.image)}>
              <span className='edit'>Edit</span>
          </div>
          <div className="listItemText1 spacing" onClick={() => { if (window.confirm('Are you sure you want to delete this room?')) handleDelete(props.item.image) } }>
              <span className='edit'>Delete</span>
          </div>
        </div>
    </div>
  );
}

const getColor = (rating) => {
    let color;
    if(rating >= 0 && rating < 4) {
        color = 'list-green'
    } else if (rating >= 4 && rating < 7) {
        color = 'list-yellow'
    } else {
        color = 'list-red'
    }

    return color;
}
