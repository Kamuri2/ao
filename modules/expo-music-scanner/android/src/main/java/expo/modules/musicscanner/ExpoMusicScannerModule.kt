package expo.modules.musicscanner

import android.content.ContentUris
import android.net.Uri
import android.provider.MediaStore
import android.media.audiofx.Equalizer
import android.media.audiofx.BassBoost
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoMusicScannerModule : Module() {
  private var equalizer: Equalizer? = null
  private var bassBoost: BassBoost? = null

  override fun definition() = ModuleDefinition {
    Name("ExpoMusicScanner")

    AsyncFunction("initAudioEngine") { ->
      try {
        if (equalizer == null) {
          equalizer = Equalizer(0, 0)
          equalizer?.enabled = true
        }
        if (bassBoost == null) {
          bassBoost = BassBoost(0, 0)
          bassBoost?.enabled = true
        }
        return@AsyncFunction true
      } catch (e: Exception) {
        e.printStackTrace()
        return@AsyncFunction false
      }
    }

    AsyncFunction("getEqualizerBands") { ->
      val result = mutableListOf<Map<String, Any>>()
      try {
        val eq = equalizer ?: return@AsyncFunction result
        val numBands = eq.numberOfBands
        for (i in 0 until numBands) {
          val freq = eq.getCenterFreq(i.toShort())
          val levelRange = eq.bandLevelRange
          result.add(mapOf(
            "index" to i,
            "frequency" to freq,
            "minLevel" to levelRange[0].toInt(),
            "maxLevel" to levelRange[1].toInt()
          ))
        }
      } catch (e: Exception) {
        e.printStackTrace()
      }
      return@AsyncFunction result
    }

    AsyncFunction("setEqualizerBandLevel") { bandIndex: Int, level: Int ->
      try {
        equalizer?.setBandLevel(bandIndex.toShort(), level.toShort())
        return@AsyncFunction true
      } catch (e: Exception) {
        return@AsyncFunction false
      }
    }

    AsyncFunction("setBassBoost") { strength: Int ->
      try {
        bassBoost?.setStrength(strength.toShort())
        return@AsyncFunction true
      } catch (e: Exception) {
        return@AsyncFunction false
      }
    }

    AsyncFunction("getAudioFiles") { folderPath: String? ->
      val context = appContext.reactContext ?: return@AsyncFunction emptyList<Map<String, Any?>>()
      val resolver = context.contentResolver
      val uri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
      
      val projection = arrayOf(
        MediaStore.Audio.Media._ID,
        MediaStore.Audio.Media.DATA,
        MediaStore.Audio.Media.TITLE,
        MediaStore.Audio.Media.ARTIST,
        MediaStore.Audio.Media.ALBUM,
        MediaStore.Audio.Media.DURATION,
        MediaStore.Audio.Media.ALBUM_ID,
        MediaStore.Audio.Media.TRACK
      )
      
      var selection: String? = null
      var selectionArgs: Array<String>? = null

      if (folderPath != null) {
          selection = "${MediaStore.Audio.Media.DATA} LIKE ?"
          selectionArgs = arrayOf("$folderPath%")
      }
      
      val cursor = resolver.query(uri, projection, selection, selectionArgs, MediaStore.Audio.Media.TITLE + " ASC")
      
      val songs = mutableListOf<Map<String, Any?>>()
      
      cursor?.use { c ->
        val idCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
        val dataCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA)
        val titleCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
        val artistCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
        val albumCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)
        val durationCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
        val albumIdCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM_ID)
        val trackCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media.TRACK)
        
        while (c.moveToNext()) {
          val id = c.getLong(idCol)
          val data = c.getString(dataCol) ?: ""
          val title = c.getString(titleCol) ?: "Desconocido"
          val artist = c.getString(artistCol) ?: "Desconocido"
          val album = c.getString(albumCol) ?: "Desconocido"
          val duration = c.getLong(durationCol)
          val albumId = c.getLong(albumIdCol)
          
          // Track number comes as something like 1001 (disc 1, track 1), we just need the track part or keep it as is
          var track = c.getInt(trackCol)
          if (track >= 1000) track = track % 1000
          
          val fileUri = ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id).toString()
          
          val artworkUri = Uri.parse("content://media/external/audio/albumart")
          val coverUri = ContentUris.withAppendedId(artworkUri, albumId).toString()
          
          val parts = data.split("/")
          val folderName = if (parts.size >= 2) parts[parts.size - 2] else "Desconocido"
          val filename = if (parts.isNotEmpty()) parts.last() else "Desconocido"
          
          var finalTitle = title
          var finalArtist = artist
          if (finalTitle.equals(folderName, ignoreCase = true) && !finalArtist.equals(folderName, ignoreCase = true)) {
            val temp = finalTitle
            finalTitle = finalArtist
            finalArtist = temp
          }
          
          songs.add(mapOf(
            "id" to id.toString(),
            "uri" to "file://" + data, // Using absolute file path is safer for TrackPlayer and Expo
            "filename" to filename,
            "folder" to folderName,
            "duration" to (duration / 1000.0), // TrackPlayer expects seconds!
            "title" to finalTitle,
            "artist" to finalArtist,
            "album" to album,
            "cover" to coverUri,
            "trackNumber" to track
          ))
        }
      }
      
      return@AsyncFunction songs
    }

    AsyncFunction("getSongDetails") { uriString: String ->
      val result = mutableMapOf<String, Any?>()
      try {
        var path = if (uriString.startsWith("file://")) uriString.substring(7) else uriString
        path = java.net.URLDecoder.decode(path, "UTF-8")
        val file = java.io.File(path)
        if (!file.exists()) return@AsyncFunction result

        // Extract Bitrate, Format, SampleRate
        try {
            val mmr = android.media.MediaMetadataRetriever()
            mmr.setDataSource(file.absolutePath)
            
            val bitrateStr = mmr.extractMetadata(android.media.MediaMetadataRetriever.METADATA_KEY_BITRATE)
            val mimetype = mmr.extractMetadata(android.media.MediaMetadataRetriever.METADATA_KEY_MIMETYPE)
            
            if (bitrateStr != null) {
                result["bitrate"] = bitrateStr.toIntOrNull() ?: 0
            }
            if (mimetype != null) {
                val format = mimetype.split("/").lastOrNull()?.uppercase() ?: "MP3"
                result["format"] = if (format == "MPEG") "MP3" else format
            }
            if (android.os.Build.VERSION.SDK_INT >= 31) {
                val samplerateStr = mmr.extractMetadata(38) // METADATA_KEY_SAMPLERATE
                if (samplerateStr != null) {
                    result["sampleRate"] = samplerateStr.toIntOrNull() ?: 44100
                }
            } else {
                result["sampleRate"] = 44100
            }
            
            // Extract high quality cover
            val pic = mmr.embeddedPicture
            if (pic != null) {
                val cacheDir = appContext.reactContext?.cacheDir
                if (cacheDir != null) {
                    val coverFile = java.io.File(cacheDir, "hq_cover_${file.name.hashCode()}.jpg")
                    if (!coverFile.exists()) {
                        val fos = java.io.FileOutputStream(coverFile)
                        fos.write(pic)
                        fos.close()
                    }
                    result["cover"] = "file://" + coverFile.absolutePath
                }
            }
            
            mmr.release()
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // Lyrics extraction (LRC file, TXT file, or jaudiotagger)
        try {
            val validExtensions = listOf(".lrc", ".txt", ".srt", ".vtt")
            val baseName = file.nameWithoutExtension.lowercase()
            var externalLyrics: String? = null
            
            val parentDir = file.parentFile
            if (parentDir != null && parentDir.isDirectory) {
                val matchingFiles = parentDir.listFiles { _, name ->
                    val lowerName = name.lowercase()
                    lowerName.startsWith(baseName) && validExtensions.any { lowerName.endsWith(it) }
                }
                
                val bestMatch = matchingFiles?.firstOrNull { it.nameWithoutExtension.lowercase() == baseName }
                if (bestMatch != null && bestMatch.canRead()) {
                    externalLyrics = bestMatch.readText().trim()
                }
            }

            if (externalLyrics != null) {
                result["lyrics"] = externalLyrics
            } else {
                java.util.logging.Logger.getLogger("org.jaudiotagger").level = java.util.logging.Level.OFF
                val audioFile = org.jaudiotagger.audio.AudioFileIO.read(file)
                val tag = audioFile.tag
                if (tag != null) {
                    var lyrics = tag.getFirst(org.jaudiotagger.tag.FieldKey.LYRICS)
                    
                    if (lyrics.isNullOrBlank() && tag is org.jaudiotagger.tag.id3.AbstractID3v2Tag) {
                        try {
                            val uslt = tag.getFirstField("USLT")
                            if (uslt != null) {
                                lyrics = uslt.toString().replace(Regex("^Text="), "")
                            } else {
                                val sylt = tag.getFirstField("SYLT")
                                if (sylt != null) {
                                    lyrics = sylt.toString()
                                }
                            }
                        } catch(e: Exception) {}
                    }

                    // Fallback to searching custom generic keys for FLAC/Vorbis
                    if (lyrics.isNullOrBlank()) {
                        lyrics = tag.getFirst("UNSYNCEDLYRICS")
                        if (lyrics.isNullOrBlank()) lyrics = tag.getFirst("SYNCEDLYRICS")
                        if (lyrics.isNullOrBlank()) lyrics = tag.getFirst("LYRICS")
                    }
                    
                    if (!lyrics.isNullOrBlank()) {
                        result["lyrics"] = lyrics!!.trim()
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
      } catch (e: Exception) {
         e.printStackTrace()
      }
      return@AsyncFunction result
    }

    AsyncFunction("getHighQualityCover") { uriString: String ->
      try {
        var path = if (uriString.startsWith("file://")) uriString.substring(7) else uriString
        path = java.net.URLDecoder.decode(path, "UTF-8")
        val file = java.io.File(path)
        if (!file.exists()) return@AsyncFunction null

        val mmr = android.media.MediaMetadataRetriever()
        mmr.setDataSource(file.absolutePath)
        val pic = mmr.embeddedPicture
        mmr.release()

        if (pic != null) {
            val cacheDir = appContext.reactContext?.cacheDir
            if (cacheDir != null) {
                val coverFile = java.io.File(cacheDir, "hq_cover_${file.name.hashCode()}.jpg")
                if (!coverFile.exists()) {
                    val fos = java.io.FileOutputStream(coverFile)
                    fos.write(pic)
                    fos.close()
                }
                return@AsyncFunction "file://" + coverFile.absolutePath
            }
        }
      } catch (e: Exception) {
        e.printStackTrace()
      }
      return@AsyncFunction null
    }

    AsyncFunction("getLyrics") { uriString: String ->
        var lyricsResult: String? = null
        try {
            var path = if (uriString.startsWith("file://")) uriString.substring(7) else uriString
            path = java.net.URLDecoder.decode(path, "UTF-8")
            val file = java.io.File(path)
            if (!file.exists()) return@AsyncFunction null

            val validExtensions = listOf(".lrc", ".txt", ".srt", ".vtt")
            val baseName = file.nameWithoutExtension.lowercase()
            
            val parentDir = file.parentFile
            if (parentDir != null && parentDir.isDirectory) {
                val matchingFiles = parentDir.listFiles { _, name ->
                    val lowerName = name.lowercase()
                    lowerName.startsWith(baseName) && validExtensions.any { lowerName.endsWith(it) }
                }
                
                val bestMatch = matchingFiles?.firstOrNull { it.nameWithoutExtension.lowercase() == baseName }
                if (bestMatch != null && bestMatch.canRead()) {
                    lyricsResult = bestMatch.readText().trim()
                }
            }

            if (lyricsResult == null) {
                java.util.logging.Logger.getLogger("org.jaudiotagger").level = java.util.logging.Level.OFF
                val audioFile = org.jaudiotagger.audio.AudioFileIO.read(file)
                val tag = audioFile.tag
                if (tag != null) {
                    var lyrics = tag.getFirst(org.jaudiotagger.tag.FieldKey.LYRICS)
                    
                    if (lyrics.isNullOrBlank() && tag is org.jaudiotagger.tag.id3.AbstractID3v2Tag) {
                        try {
                            val uslt = tag.getFirstField("USLT")
                            if (uslt != null) {
                                lyrics = uslt.toString().replace(Regex("^Text="), "")
                            } else {
                                val sylt = tag.getFirstField("SYLT")
                                if (sylt != null) {
                                    lyrics = sylt.toString()
                                }
                            }
                        } catch(e: Exception) {}
                    }

                    if (lyrics.isNullOrBlank()) {
                        lyrics = tag.getFirst("UNSYNCEDLYRICS")
                        if (lyrics.isNullOrBlank()) lyrics = tag.getFirst("SYNCEDLYRICS")
                        if (lyrics.isNullOrBlank()) lyrics = tag.getFirst("LYRICS")
                    }
                    
                    if (!lyrics.isNullOrBlank()) {
                        lyricsResult = lyrics!!.trim()
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return@AsyncFunction lyricsResult
    }
  }
}
