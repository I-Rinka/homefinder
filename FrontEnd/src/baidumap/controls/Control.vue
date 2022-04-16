<template>
<div>
  <slot></slot>
</div>
</template>

<script>
import commonMixin from '../base/mixins/common.js'
import {createSize} from '../base/factory.js'

export default {
  name: 'bm-control',
  mixins: [commonMixin('control')],
  props: ['anchor', 'offset'],
  watch: {
    anchor (val) {
      this.originInstance.setAnchor(val)
    },
    offset (val) {
      this.originInstance.setOffset(val)
    }
  },
  methods: {
    load () {
   
    }
  }
}
</script>
