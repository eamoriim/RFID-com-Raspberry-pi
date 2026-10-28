
import RPi.GPIO as GPIO
from mfrc522 import MFRC522

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

GPIO.setup(25, GPIO.OUT)
GPIO.output(25, GPIO.HIGH)

leitor = MFRC522(
    bus=0,
    device=0,
    spd=100000,
    pin_mode=GPIO.BCM,
    pin_rst=25
)

print("Modo GPIO:", GPIO.getmode())
print("Estado do reset:", GPIO.input(25))
print("Versão do RC522:", hex(leitor.Read_MFRC522(0x37)))

GPIO.cleanup()
