DEST='/media/usb/serverbackup'
if [ -f "${DEST}/back.old.tar.xz" ] ; then
    rm -f  "${DEST}/back.old.tar.xz"
fi
if [ -f "${DEST}/back.tar.xz" ] ; then
    mv  "${DEST}/back.tar.xz" "${DEST}/back.old.tar.xz"
fi
scp -i ~/.ssh/id_rsa root@hypermemia.link:/home/laroi/back.tar.xz "${DEST}/back.tar.xz"