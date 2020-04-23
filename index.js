var container = document.getElementById("root");
var initialChildren = [
    {id: 1, background: '#8ce8df', size: 100, position: {x: 100, y: 10}},
    {id: 2, background: '#8ce8df', size: 100, position: {x: 400, y: 106}},
    {id: 3, background: '#d2aff6', size: 150, position: {x: 100, y: 316}},
    {id: 4, background: '#fee493', size: 200, position: {x: 480, y: 376}},
]

function initChild(item) {
    var childStyle = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        cursor: 'move',
    }
    var child = document.createElement('div');
    for (var i in childStyle) {
        child.style[i] = childStyle[i]
    }
    child.id = item.id;
    child.className = 'drag-child';
    child.style.background = item.background;
    child.style.width = item.size + 'px';
    child.style.height = item.size + 'px';
    child.style.left = item.position.x + 'px';
    child.style.top = item.position.y + 'px';

    return child
}

function render() {
    var containerStyle = {
        position: 'relative',
        height: 600 + 'px',
        boxShadow: '0 0 5px 1px #CCC inset',
        background: '#F5F8FA',
        color: '#4A4A4A',
        marginLeft: 20 + 'px',
        marginTop: 60 + 'px',
        width: 'auto',
    }

    for (var i in containerStyle) {
        container.style[i] = containerStyle[i]
    }
    initialChildren.forEach(function (item, index) {
        var child = initChild(item);
        container.appendChild(child);
    })

    var dragger = new dragContainer({
        item: 'drag-child',//拖拽的子元素所包含的类名,必填
        range: 'box',//拖拽子元素所在的容器元素所包含的类名,必填
        min_distance: 8,//最小吸附距离，默认为8，可为空
        drag: true,//是否启用拖拽
        guide: {
            zIndex: 1,//参考线层级
            lineColor: 'red',
            lineWidth: 1,
        }
    });
    dragger.init()
}

render();