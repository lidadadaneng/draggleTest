/**
 * @desc 实现元素拖动带有辅助线并自动吸附功能
 * @date 2020-04-23
 * @author 王程海
 * @param props(object) 辅助线属性
 * @param props.item(String) 拖拽的子元素所包含的类名,必填
 * @param props.range(String) 拖拽子元素所在的容器元素所包含的类名,必填
 * @param props.min_distance(Number) 最小吸附距离，可为空，默认8
 * @param props.drag(boolean) 是否启用拖拽，可为空，默认不启用
 * @param props.guide(object) 辅助线样式设置，可为空
 * @param props.guide.zIndex(Number) 辅助线层级，可为空，默认999
 * @param props.guide.lineColor(String) 辅助线颜色，可为空，默认'#FF00CC'
 * @param props.guide.lineWidth(Number) 辅助线宽度，可为空，默认1
 *
 * */
//创建辅助线容器类
function dragContainer(props) {
    this.item = props.item ? document.getElementsByClassName(props.item) : null;
    this.range = (document.getElementsByClassName(props.range).length == 1) ? document.getElementsByClassName(props.range)[0] : null;
    this.min_distance = props.min_distance;
    this.drag = props.drag;
    this.guide = props.guide;
    this.guide_v = null;
    this.guide_h = null;
    this.getGuideV = function () {
        var guide_v = this.guide_v;
        return guide_v
    }
    this.setGuideV = function (guide_v) {
        this.guide_v = guide_v;
    }
    this.getGuideH = function () {
        var guide_h = this.guide_h;
        return guide_h
    }
    this.setGuideH = function (guide_h) {
        this.guide_h = guide_h;
    }
    this.init = function () {
        var that = this;
        if (this.initGuide()) {
            var child = this.item;
            for (var i = 0; i < child.length; i++) {
                new dragChild({
                    item: child[i],
                    range: that.range,
                    drag: that.drag,
                    guide: that.guide,
                    guide_v: that.guide_v,
                    guide_h: that.guide_h
                }).init()
            }
        }


    }
    this.initGuide = function () {
        var that = this;
        if (that.range) {
            if (!that.getGuideV()) {
                var guide = document.createElement('div');
                guide.id = 'guide-v';
                that.setGuideV(guide);
                that.range.appendChild(that.guide_v)
            }
            if (!that.getGuideH()) {
                var guide = document.createElement('div');
                guide.id = 'guide-h';
                that.setGuideH(guide);
                that.range.appendChild(that.guide_h)
            }
        } else {
            console.error("请检查父容器是否存在且唯一")
            return false
        }
        return true

    }
}

//创建辅助线子元素类
function dragChild(props) {
    this.MIN_DISTANCE = props.min_distance || 8; //捕获的最小距离
    this.guides = []; // 没有可用的引导
    // this.innerOffsetX = 0;
    // this.innerOffsetY = 0;
    this.child = props.item || null;
    this.container = props.range || null;
    this.drag = props.drag;
    this.guide = props.guide || {};
    this.guide_v = props.guide_v;
    this.guide_h = props.guide_h;
    this.document = document;
    this.init = function () {
        var that = this;
        if (that.child && that.container && that.drag) {
            that.child.onmousedown = function (e) { //鼠标按下事件
                /*=============================================================*/
                that.guides = [];
                for (var i = 0; i < that.container.children.length; i++) {
                    if (that.container.children[i] != that.child) {
                        var arr = that.computeGuidesForElement(that.container.children[i])
                        for (var j = 0; j < arr.length; j++) {
                            that.guides.push(arr[j])
                        }
                    }

                }
                that.innerOffsetX = that.container.offsetLeft;
                that.innerOffsetY = that.container.offsetTop;
                /*===============================================================*/
                // guides = container.children
                e = e || window.event; //事件对象
                var x_down = e.clientX; //鼠标按下X的坐标
                var y_down = e.clientY; //鼠标按下Y的坐标
                var leftDown = this.offsetLeft; //获取盒子的初始left值
                var topDown = this.offsetTop; //获取盒子的初始top值
                var position = {
                    x_down: x_down,
                    y_down: y_down,
                    leftDown: leftDown,
                    topDown: topDown,
                }
                that.ondrag(that.document, that.child, position)
                that.dragend(that.document)
                return false //阻止默认事件

            }
        } else {
            console.error("请检查子元素和容器元素传入是否正确")
        }

    }
    this.ondrag = function (document, child, position) {
        var that = this;
        var x_down = position.x_down;
        var y_down = position.y_down;
        var leftDown = position.leftDown;
        var topDown = position.topDown;
        document.onmousemove = function (e) { //鼠标移动事件
            e = e || window.event;
            var x_move = e.clientX; //鼠标移动X的坐标
            var y_move = e.clientY; //鼠标移动Y的坐标
            //移动的坐标减去按下的坐标 = 移动的距离
            var x_now = x_move - x_down;
            var y_now = y_move - y_down;
            //赋值给left和top
            if ((topDown + y_now) < 0) {
                child.style.top = 0 + 'px'
            } else if ((topDown + y_now) > (that.container.offsetHeight - child.offsetHeight)) {
                child.style.top = that.container.offsetHeight - child.offsetHeight + 'px'
            } else {
                child.style.top = topDown + y_now + 'px';
            }
            if ((leftDown + x_now) < 0) {
                child.style.left = 0 + 'px'
            } else if ((leftDown + x_now) > (that.container.offsetWidth - child.offsetWidth)) {
                child.style.left = that.container.offsetWidth - child.offsetWidth + 'px'
            } else {
                child.style.left = leftDown + x_now + 'px';
            }
            /*===================================================================*/
            //迭代所有的guids，记住最近的h和v guids
            var chosenGuides = {
                top: {
                    dist: that.MIN_DISTANCE + 1
                },
                left: {
                    dist: that.MIN_DISTANCE + 1
                }
            };
            // var $t = this;
            //鼠标相对于窗口的x、y坐标
            var pos = {
                top: child.offsetTop,
                left: child.offsetLeft
                // top: (e.clientY - Number(container.style.top.match(/[0-9]*/)[0])) - innerOffsetY,
                // left: (e.clientX - Number(container.style.left.match(/[0-9]*/)[0])) - innerOffsetX
            };
            //outerHeight、outerWidth：整个浏览器的高度、宽度
            var w = child.style.width.match(/[0-9]*/)[0] - 1;
            var h = child.style.height.match(/[0-9]*/)[0] - 1;
            var elemGuides = that.computeGuidesForElement(null, pos, w, h);
            that.guides.forEach(function (guide, i) {
                elemGuides.forEach(function (elemGuide, i) {
                    if (guide.type == elemGuide.type) {
                        var prop = guide.type == "h" ? "top" : "left";
                        var d = Math.abs(elemGuide[prop] - guide[prop]);
                        if (d < chosenGuides[prop].dist) {
                            chosenGuides[prop].dist = d;
                            chosenGuides[prop].offset = elemGuide[prop] - pos[prop];
                            chosenGuides[prop].guide = guide;
                        }
                    }
                })

            })
            if (chosenGuides.top.dist <= that.MIN_DISTANCE) {
                that.guide_v.innerHTML = ""
                var guide = that.createGuide({
                    left: 0,
                    top: Number(chosenGuides.top.guide.top),
                    // top: Number(chosenGuides.top.guide.top + that.innerOffsetY),
                    type: 'v',
                })
                that.guide_v.appendChild(guide);
                child.style.top = (chosenGuides.top.guide.top - chosenGuides.top.offset) + 'px';
            } else {
                that.guide_v.innerHTML = ""
            }
            if (chosenGuides.left.dist <= that.MIN_DISTANCE) {
                document.getElementById('guide-h').innerHTML = ""
                var guide = that.createGuide({
                    left: Number(chosenGuides.left.guide.left),
                    // left: Number(chosenGuides.left.guide.left + that.innerOffsetX),
                    top: 0,
                    type: 'h',
                })
                that.guide_h.appendChild(guide);
                child.style.left = (chosenGuides.left.guide.left - chosenGuides.left.offset) + 'px';
            } else {
                that.guide_h.innerHTML = ""
            }
            /*===================================================================*/
        }
    }
    this.dragend = function (document) {
        var that = this
        document.onmouseup = function () { //鼠标抬起事件
            //清除移动和抬起事件
            this.onmousemove = this.onmouseup = null;
            that.guide_h.innerHTML = ""
            that.guide_v.innerHTML = ""

        }
    }
    this.computeGuidesForElement = function (elem, pos, w, h) {
        if (elem != null) {
            var $t = elem;
            //offset:返回当前元素 的偏移量
            // pos = $t.style;
            pos = {
                left: $t.offsetLeft,
                top: $t.offsetTop
                // left: Number($t.style.left.match(/[0-9]*/)[0]),
                // top: Number($t.style.top.match(/[0-9]*/)[0])
            }
            w = $t.clientWidth - 1;
            h = $t.clientWidth - 1;
        }
        return [{
            type: "h",
            left: pos.left,
            top: pos.top
        }, //垂直方向左下对齐线
            {
                type: "h",
                left: pos.left,
                top: pos.top + h
            },
            {
                type: "v",
                left: pos.left,
                top: pos.top
            },
            {
                type: "v",
                left: pos.left + w,
                top: pos.top
            },
            {
                type: "h",
                left: pos.left,
                top: pos.top + h / 2
            },
            {
                type: "v",
                left: pos.left + w / 2,
                top: pos.top
            }];
    }
    this.createGuide = function (guideProps) {
        var guide_props = {
            left: guideProps.left || 0,
            top: guideProps.top || 0,
            type: guideProps.type,
            zIndex: this.guide.zIndex || 999,
            lineWidth: this.guide.lineWidth || 1,
            lineColor: this.guide.lineColor || '#FF00CC',
        }
        var guide = document.createElement('div');
        guide.style.position = 'absolute';
        guide.style.left = guide_props.left + 'px';
        guide.style.top = guide_props.top + 'px';
        guide.style.zIndex = guide_props.zIndex
        if (guide_props.type == 'v') {
            guide.style.borderTop = guide_props.lineWidth + "px solid " + guide_props.lineColor;
            guide.style.width = '100%'
        } else if (guide_props.type == 'h') {
            guide.style.borderLeft = guide_props.lineWidth + "px solid " + guide_props.lineColor;
            guide.style.height = '100%'
        }
        return guide
    }
}
