import EventBus from "@/bus";



export function healthMonitor(title) {
  EventBus.$emit('changeMonitorUI', {
    show: true,
    name: title,
  });

}

export function hideMonitor() {
  EventBus.$emit('changeMonitorUI', {
    show: false,
    name: '',
  })
}