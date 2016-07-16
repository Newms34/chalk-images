# Chalk Image Converter

image size:
dims.height
dims.width

px per width (which is also px per height):
dims.width/80
call this sz

we COULD put px data (rgb vals) in arrays of arrays:
[[1,2,3],
[4,5,6],
[7,8,9]]

so, for each cell:
get pos, get sz
for rows i=0 to i<sz + pos.y
 and for cols j=0 j<sz +pos.x
  add to avgs array
 do this for all px-blocks in that ROW
 then add sz to pos.y, so next px-block row

