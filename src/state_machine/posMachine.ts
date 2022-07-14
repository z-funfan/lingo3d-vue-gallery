import { createMachine } from "xstate";

export default createMachine({
    states:{
        idle: {
            on:{
                KEY_W_ON: "running",
                KEY_A_ON: "running",
                KEY_S_ON: "running",
                KEY_D_ON: "running",
                KEY_SPACE_DOWN: "jumping"
            }
        },
        running: {
            on:{
                KEY_W_UP: "idle",
                KEY_SPACE_DOWN: "jumping"
            }
        },
        jumping: {
            on: {
                LANDED: "idle"
            },
            entry: "enterJumping"
        },
    },
    initial: "idle"
})