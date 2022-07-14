<script setup lang="ts">
import { World, Model, Find, HTML, ThirdPersonCamera, useSpring, types, Keyboard, Editor, usePreload } from "lingo3d-vue"
import { computed, ref } from "vue"
import {useMachine} from "@xstate/vue"
import poseMachine from "./state_machine/posMachine"
import filelist from './filelist.json'
const progress = usePreload(filelist, "33.1mb")

const mouseOver = ref(false)
const bot = ref<types.Model>()

const camX = computed(() => mouseOver.value ? 25 : 0)
const camY = computed(() => mouseOver.value ? 50 : 50)
const camZ = computed(() => mouseOver.value ? 50 : 200)

const xSpring = useSpring({ to: camX, bounce: 0 })
const ySpring = useSpring({ to: camY, bounce: 0 })
const zSpring = useSpring({ to: camZ, bounce: 0 })

const outline = ref(false)

const { state, send } = useMachine(poseMachine, {
  actions: {
    enterJumping: () => {
      // bot.value?.velocity.y += 10
      if (bot === undefined || bot.value === undefined ) {
        return
      } else {
        bot.value.velocity.y = 8
        bot.value.onLoop = () => {
          if (bot.value?.velocity.y === 0) {
            bot.value.onLoop = undefined
            send("LANDED")
          }
        }
      } 
    }
  }
});

const pose = ref(state)

const current_character = ref('girl')

var tiemout_running = 0
const startRunning= ()=> {
  send('KEY_W_ON')
  bot.value?.moveForward(-5)
  if (tiemout_running) {
    clearTimeout(tiemout_running)
  }
  tiemout_running = setTimeout(()=> {
    startRunning()
  },1000/60
  )
}
const stopRunning= ()=> {
  send('KEY_W_UP')
  clearTimeout(tiemout_running)
}

const handleKeyPress = (key: String) => {
  if (key === 'w' || key === 'W' ) {
    send('KEY_W_ON')
    bot.value?.moveForward(-5)
  }else if (key === 'a' || key === 'A' ) {
    send('KEY_A_ON')
    bot.value?.moveRight(5)
  }else if (key === 's' || key === 'D' ) {
    send('KEY_S_ON')
    bot.value?.moveForward(5)
  }else if (key === 'd' || key === 'D' ) {
    send('KEY_D_ON')
    bot.value?.moveRight(-5)
  } else if (key === 'Space') {
    send('KEY_SPACE_DOWN')
  }
};
const handleKeyUp = (key: String) => {
    if (key === 'w' || key === 'W' ||
    key === 'a' || key === 'A' || 
    key === 's' || key === 'S'  ||
    key === 'd' || key === 'D' ) {
    send('KEY_W_UP')
  } 
}

const switchCharacter= () => {
  current_character.value==='boy'?current_character.value='girl':current_character.value='boy'
}


</script>

<template>
  <div class="loading" v-if="progress < 100">
    <div id="loader">
      <div id="shadow"></div>
      <div id="box"></div>
    </div>
  </div>
  <World
    v-else
    default-light="shanghai_bund_1k.hdr"
    skybox="shanghai_bund_1k.hdr"
    ambientOcclusion
    bloom
    :bloom-strength="0.2"
    :bloom-radius="1"
    :bloomThreshold="1"
    outline-hidden-color="red"
    :outline-pulse="1000"
    outline-pattern="pattern.jpeg"
    :repulsion="1"
  >
    <Model src="scene/scene.gltf" :scale="85" physics="map" :y="2800" :rotationY="49">
    </Model>
    <ThirdPersonCamera
      :mouse-control="true"
      :active="true"
      :innerY="ySpring"
      :innerZ="zSpring"
      :innerX="xSpring"
    >
      <Model
        v-if="current_character === 'boy'"
        src="characters/boy/boy.fbx"
        ref="bot"
        physics="character"
        :animations='{ idle: "characters/boy/idle.fbx", running: "characters/boy/running.fbx" , jumping: "characters/boy/falling.fbx"}'
        :animation="pose.value"
        :x="243.19"
        :y="200"
        :z="-577.26"
        :scale="1.3"
        :boxVisible = "false"
        :inner-y="-15"
        pbr
      />
      <Model
        v-if="current_character === 'girl'"
        src="characters/girl/girl.fbx"
        ref="bot"
        physics="character"
        :animations='{ idle: "characters/girl/idle-female.fbx", running: "characters/girl/running-female.fbx" , jumping: "characters/girl/falling-female.fbx"}'
        :animation="pose.value"
        :x="243.19"
        :y="200"
        :z="-577.26"
        :scale="1.3"
        :boxVisible = "false"
        :inner-y="-15"
        pbr
      />
    </ThirdPersonCamera>
    <Keyboard @key-press="handleKeyPress" @key-up="handleKeyUp" />

  </World>
  <!-- <Editor/> -->

  <div class="switch control">
    <div @click="switchCharacter"><span>{{current_character}}</span></div>
  </div>
  <div class="run control">
    <div @touchstart="startRunning()" @touchend="stopRunning()"><span>Run</span></div>
  </div>
  <div class="jump control">
    <div @click="send('KEY_SPACE_DOWN')"><span>Jump</span></div>
  </div>
</template>

<style>
  .progress {
    margin-top: -50px;
  }
  #loader {
    /* Uncomment this to make it run! */
    /*
      animation: loader 5s linear infinite; 
    */
    
    position: absolute;
    top: calc(50% - 20px);
    left: calc(50% - 20px);
  }
  @keyframes loader {
    0% { left: -100px }
    100% { left: 110%; }
  }
  #box {
    width: 50px;
    height: 50px;
    background: #fff;
    animation: animate .5s linear infinite;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 3px;
  }
  @keyframes animate {
    17% { border-bottom-right-radius: 3px; }
    25% { transform: translateY(9px) rotate(22.5deg); }
    50% {
      transform: translateY(18px) scale(1,.9) rotate(45deg) ;
      border-bottom-right-radius: 40px;
    }
    75% { transform: translateY(9px) rotate(67.5deg); }
    100% { transform: translateY(0) rotate(90deg); }
  } 
  #shadow { 
    width: 50px;
    height: 5px;
    background: #000;
    opacity: 0.1;
    position: absolute;
    top: 59px;
    left: 0;
    border-radius: 50%;
    animation: shadow .5s linear infinite;
  }
  @keyframes shadow {
    50% {
      transform: scale(1.2,1);
    }
  }


  body {
    background: #6997DB; 
    overflow: hidden;
  }


  .switch {
    right: 60px;
    top: 60px;

  }
  .run {
    left: 60px;
    bottom: 60px;

  }
  .jump {
    right: 60px;
    bottom: 60px;
  }
  .control {
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.26);
    border-radius: 50px;
    position: absolute;
    padding: 5px;
    text-align: center;
    line-height: 90px;
    color: antiquewhite;
    z-index: 5000;
  }
  .control:active {
    background: rgba(255, 255, 255, 0.5);
  }
</style>