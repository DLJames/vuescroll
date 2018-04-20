import scrollMap from "../config/scrollMap";
import {
  renderTransform,
  on,
  off
} from "../util";

export default {
  name: "bar",
    
  computed: {
    bar() {
      return scrollMap[this.type].bar;
    },
    axis() {
      return scrollMap[this.type].axis;
    },
    parent() {
      return this.$parent.$refs;
    }
  },
  render(h) { //eslint-disable-line
    let style = {
      [this.bar.posName]: 0,
      [this.ops.pos]: 0,
      [this.bar.size]: this.state.size,
      [this.bar.opsSize]: this.ops[this.bar.opsSize],
      background: this.ops.background,
      opacity: this.state.opacity,
      cursor: "pointer",
      position: "absolute",
      borderRadius: "4px",
      transition: "opacity .5s",
      userSelect: "none",
      ...renderTransform(this.type, this.state.posValue)
    };
    const data = {
      style: style,
      class: `vuescroll-${this.type}-scrollbar`,
      on: {
        mousedown: this.handleMousedown 
      }
    };
    if(this.ops.hover) {
      data.on["mouseenter"] = () => {
        this.$el.style.background = this.ops.hover;
      };
      data.on["mouseleave"] = () => {
        this.$el.style.background = this.ops.background;
      };   
    }
    return (
      <div
        {...data}
      >
      </div>
    );
  },
  methods: {
    handleMousedown(e) {
      e.stopPropagation();
      this.axisStartPos = e[this.bar.client] - this.$el.getBoundingClientRect()[this.bar.posName];
      // tell parent that the mouse has been down.
      this.$emit("setMousedown", true);
      on(document, "mousemove", this.handleMouseMove);
      on(document, "mouseup", this.handleMouseUp);
    },
    handleMouseMove(e) {
    /**
     * I really don't have an
     * idea to test mousemove...
     */
            
      /* istanbul ignore next */
      if(!this.axisStartPos ) {
        return;
      }
      /* istanbul ignore next */
      {
        const delta = e[this.bar.client] - this.parent[`${this.type}Rail`].getBoundingClientRect()[this.bar.posName];
        const percent = (delta-this.axisStartPos) / this.parent[`${this.type}Rail`][this.bar.offset];
        this.$parent.scrollTo(
          {
            [this.axis.toLowerCase()]: (this.parent["scrollPanel"].$el[this.bar.scrollSize] * percent)
          },
          false
        );
      } 
    },
    handleMouseUp() {
      this.$emit("setMousedown", false);
      this.$parent.hideBar();
      this.axisStartPos = 0;
      off(document, "mousemove", this.handleMouseMove);
      off(document, "mouseup", this.handleMouseUp);
    }
  },
  props: {
    ops: {
      type: Object,
      required: true
    },
    state: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  }
};

/**
* create bars
* 
* @param {any} size 
* @param {any} type 
*/
export function createBar(h, vm, type) {
  // hBar data
  const barOptionType = type === "vertical"? "vBar": "hBar";
  const axis = type === "vertical"? "Y": "X";

  const barData = {
    props: {
      type: type,
      ops: vm.mergedOptions[barOptionType],
      state: vm[barOptionType].state
    },
    on: {
      setMousedown: vm.setMousedown
    },
    ref: `${type}Bar`
  };
  if(!vm[barOptionType].state.size 
   || !vm.mergedOptions.scrollPanel["scrolling" + axis]
   || vm.mergedOptions.vuescroll.paging
   || vm.mergedOptions.vuescroll.snapping 
   || (vm.refreshLoad && type !== "vertical" && vm.mode === "slide")) {
    return null;
  }
  return (
    <bar 
      {...barData}
    />
  );
}