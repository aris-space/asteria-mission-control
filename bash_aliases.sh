
mv-set-low-power() {
    echo -e "p TX_POWER = 1\rp RX_POWER = 1" | sudo socat -T1 - /dev/ttyUSB1,raw,echo=0,b115200
}

mv-set-high-power() {
    echo -e "p TX_POWER = 3\rp RX_POWER = 3" | sudo socat -T1 - /dev/ttyUSB1,raw,echo=0,b115200
}

set-fc-time() {
    local fc_name=${REMOTE:-hermes@hermes3.local}
    ssh "$fc_name" "sudo date -s \"$(date '+%Y-%m-%d %H:%M:%S')\""
}

set-rfs-time() {
    ssh "pi@rfsc.local" "sudo date -s \"$(date '+%Y-%m-%d %H:%M:%S')\""
}
