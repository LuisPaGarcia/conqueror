import React from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import jsonbox from '../../services/jsonbox'
import debounce from '../../utils/debounce'

type Item = { id: string; content: string; checked: boolean }

type ItemArray = Item[]

type Items = {
  items: ItemArray
  input: string
}

const checkboxStyle = {
  margin: '0 0 0 0',
  cursor: 'pointer',
  width: '31px',
  height: '19px'
}

const containerStyles = {
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column' as 'column',
  alignItems: 'center'
}

const innerStyle = {
  width: '190px'
}

// a little function to help us with reordering the result
const reorder = (
  list: ItemArray,
  startIndex: number,
  endIndex: number
): ItemArray => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

const grid: number = 8

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  display: 'flex',

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'grey',

  // styles we need to apply on draggables
  ...draggableStyle
})

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: grid,
  width: 250
})

const inputStyle = {
  fontSize: '20px'
}

class List extends React.Component<{}, Items> {
  constructor(props) {
    super(props)

    this.state = {
      items: [],
      input: ''
    }
    this.onDragEnd = this.onDragEnd.bind(this)
    this.fetch()
  }

  fetch = async () => {
    const data: any = await jsonbox.get()
    this.setState(
      {
        items: JSON.parse(data.data[0].items)
      },
      () =>
        window.localStorage.setItem('items', JSON.stringify(this.state.items))
    )
    console.log(data)
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    const items = reorder(
      this.state.items,
      result.source.index,
      result.destination.index
    )

    this.setState(
      {
        items
      },
      this.saveInStorage
    )
  }

  saveInStorage = debounce(async () => {
    const data: string = JSON.stringify(this.state.items)
    window.localStorage.setItem('items', data)
    const response = await jsonbox.put(data)
    console.log(response)
  }, 1000)

  setInput = ({ target: { value: input } }) => {
    this.setState({
      input
    })
  }

  handleKeyDown = e => {
    if (e.key === 'Enter' && !!this.state.input) {
      this.setState(
        {
          items: [
            ...this.state.items,
            {
              id: `item-${this.state.items.length + 100}`,
              content: this.state.input,
              checked: false
            }
          ],
          input: ''
        },
        this.saveInStorage
      )
    }
  }

  handleCheck = e =>
    this.setState(
      {
        items: this.state.items.map(item =>
          item.id === e.target.id ? { ...item, checked: !item.checked } : item
        )
      },
      this.saveInStorage
    )

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    return (
      <>
        <div className='container' style={containerStyles}>
          <h1>Task list</h1>
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId='droppable'>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {this.state.items.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          <span style={innerStyle}>{item.content}</span>
                          <input
                            id={item.id}
                            type='checkbox'
                            style={checkboxStyle}
                            checked={item.checked}
                            onChange={this.handleCheck}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <NewItem
            onchange={this.setInput}
            value={this.state.input}
            onkeydown={this.handleKeyDown}
          />
        </div>
      </>
    )
  }
}

const NewItem = ({ onchange, value, onkeydown }) => (
  <input
    style={inputStyle}
    type='text'
    onChange={onchange}
    value={value}
    onKeyDown={onkeydown}
  />
)

export default List
