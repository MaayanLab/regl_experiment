module.exports = function make_position_arr(num_row, num_col){

  // draw matrix cells
  /////////////////////////////////////////
  // set up offset array for buffer
  var offset = {};
  offset.x = 0.5;
  offset.y = 0.5;

  // generate x position array
  x_arr = Array(num_col).fill()
    .map(function(_, i){
      return i/num_col - offset.x
    });

  y_arr = Array(num_row).fill()
    .map(function(_, i){
      return -i/num_row + offset.y - 1/num_row
    });

  // pass along row and col node information
  row_nodes = network.row_nodes;
  col_nodes = network.col_nodes;

  // generate x and y positions
  ////////////////////////////////
  function position_function(_, i){

    // looking up x and y position
    var col_id = i % num_col;
    var row_id = Math.floor(i / num_col);

    row_order_id = num_row - 1 - row_nodes[row_id].clust;
    col_order_id = num_col - 1 - col_nodes[col_id].clust;

    var x = x_arr[ col_order_id ];
    var y = y_arr[ row_order_id ];

    return [x, y];
  };

  position_arr = Array(num_row * num_col)
            .fill()
            .map(position_function);

  return position_arr;

};