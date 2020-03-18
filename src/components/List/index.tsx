import React from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

type Item = { id: string; content: string }

type ItemArray = Item[]

type Items = {
  items: ItemArray
  input: string
}

// fake data generator
const getItems = (count: number): ItemArray =>
  Array.from({ length: count }, (v, k) => k).map((k: number) => ({
    id: `item-${k}`,
    content: `item ${k}`
  }))

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
      items: getItems(5),
      input: ''
    }
    this.onDragEnd = this.onDragEnd.bind(this)
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

    this.setState({
      items
    })
  }

  setInput = ({ target: { value: input } }) => {
    this.setState({
      input
    })
  }

  handleKeyDown = e => {
    if (e.key === 'Enter' && !!this.state.input) {
      this.setState({
        items: [
          ...this.state.items,
          {
            id: `item-${this.state.items.length + 100}`,
            content: this.state.input
          }
        ],
        input: ''
      })
    }
  }

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    return (
      <>
        <h1>Drag & Drop test</h1>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId='droppable'>
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
              >
                {this.state.items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
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
                        {item.content}
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
