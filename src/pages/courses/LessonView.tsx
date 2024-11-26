import React from 'react';
import { MainLayout } from '../../components/Layout/MainLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

export const LessonView = () => {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const videoRef = React.useRef<HTMLIFrameElement>(null);
  const [watchProgress, setWatchProgress] = React.useState(0);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [hasStartedWatching, setHasStartedWatching] = React.useState(false);
  const [lastUpdateTime, setLastUpdateTime] = React.useState(0);
  const [isSkipping, setIsSkipping] = React.useState(false);
  const [currentLesson, setCurrentLesson] = React.useState<any>(null);
  const [navigation, setNavigation] = React.useState<{
    previousLesson: { moduleId: string; lessonId: string } | null;
    nextLesson: { moduleId: string; lessonId: string } | null;
  }>({
    previousLesson: null,
    nextLesson: null
  });

  // Mock data - replace with API call
  React.useEffect(() => {
    // Simulating API call to get course data
    const course = {
      id: courseId,
      modules: [
        {
          id: '1',
          lessons: [
            { id: '1', title: 'Lesson 1', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: '2', title: 'Lesson 2', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
          ]
        },
        {
          id: '2',
          lessons: [
            { id: '3', title: 'Lesson 3', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: '4', title: 'Lesson 4', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
          ]
        }
      ]
    };

    // Find current lesson and set navigation
    let foundCurrentLesson = false;
    let previousLesson = null;
    let nextLesson = null;

    for (let moduleIndex = 0; moduleIndex < course.modules.length; moduleIndex++) {
      const module = course.modules[moduleIndex];
      for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex++) {
        const lesson = module.lessons[lessonIndex];
        
        if (foundCurrentLesson && !nextLesson) {
          nextLesson = { moduleId: module.id, lessonId: lesson.id };
          break;
        }
        
        if (lesson.id === lessonId) {
          foundCurrentLesson = true;
          setCurrentLesson(lesson);
        }
        
        if (!foundCurrentLesson) {
          previousLesson = { moduleId: module.id, lessonId: lesson.id };
        }
      }
      if (foundCurrentLesson && nextLesson) break;
    }

    setNavigation({ previousLesson, nextLesson });
  }, [courseId, moduleId, lessonId]);

  // Prevent right-click
  React.useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 's' || e.key === 'u')) ||
        e.key === 'F12' ||
        (e.altKey && e.key === 'PrintScreen')
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  React.useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    let player: any;
    let progressInterval: NodeJS.Timeout;

    // @ts-ignore
    window.onYouTubeIframeAPIReady = () => {
      // @ts-ignore
      player = new YT.Player('video-player', {
        events: {
          onStateChange: (event: any) => {
            if (event.data === 1) {
              setHasStartedWatching(true);
              startProgressTracking(player);
            }
            if (event.data === 2) {
              clearInterval(progressInterval);
            }
            if (event.data === 0) {
              handleVideoComplete();
            }
          },
          onReady: (event: any) => {
            event.target.setPlaybackQuality('hd720');
          }
        },
        playerVars: {
          modestbranding: 1,
          rel: 0,
          controls: 1,
          disablekb: 1,
        }
      });
    };

    return () => {
      if (player) {
        player.destroy();
      }
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, []);

  const startProgressTracking = (player: any) => {
    const interval = setInterval(() => {
      if (player) {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        const progress = (currentTime / duration) * 100;

        if (currentTime - lastUpdateTime > 5) {
          setIsSkipping(true);
          player.seekTo(lastUpdateTime, true);
        } else {
          setIsSkipping(false);
          setLastUpdateTime(currentTime);
        }

        setWatchProgress(progress);

        if (progress >= 95 && !isCompleted) {
          handleVideoComplete();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  const handleVideoComplete = async () => {
    if (!isCompleted) {
      setIsCompleted(true);
      
      try {
        // API call to mark lesson as completed would go here
        
        if (navigation.nextLesson) {
          setTimeout(() => {
            navigate(`/courses/${courseId}/modules/${navigation.nextLesson.moduleId}/lessons/${navigation.nextLesson.lessonId}`);
          }, 2000);
        }
      } catch (error) {
        console.error('Error marking lesson as completed:', error);
      }
    }
  };

  if (!currentLesson) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-64px)] bg-[#141414]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate(`/courses/${courseId}`)}
              className="flex items-center text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Voltar ao curso
            </button>
            <div className="flex items-center gap-4">
              {navigation.previousLesson && (
                <button
                  onClick={() => navigate(`/courses/${courseId}/modules/${navigation.previousLesson.moduleId}/lessons/${navigation.previousLesson.lessonId}`)}
                  className="btn-secondary flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Aula Anterior
                </button>
              )}
              {navigation.nextLesson && (
                <button
                  onClick={() => navigate(`/courses/${courseId}/modules/${navigation.nextLesson.moduleId}/lessons/${navigation.nextLesson.lessonId}`)}
                  className="btn-secondary flex items-center"
                  disabled={!isCompleted}
                >
                  Próxima Aula
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Video Section */}
            <div className="bg-[#1F1F1F] rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-video">
                <iframe
                  id="video-player"
                  ref={videoRef}
                  src={`${currentLesson.videoUrl}&enablejsapi=1&origin=${window.location.origin}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="h-1 bg-gray-800">
                <div 
                  className="h-full bg-[#E50914] transition-all duration-300"
                  style={{ width: `${watchProgress}%` }}
                />
              </div>
            </div>

            {/* Content and Materials */}
            <div className="grid grid-cols-1 gap-6">
              {/* Lesson Content */}
              <div className="bg-[#1F1F1F] rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold text-white mb-4">
                  {currentLesson.title}
                </h1>
                <div 
                  className="prose prose-invert max-w-none text-gray-300"
                  dangerouslySetInnerHTML={{ __html: currentLesson.description || '' }}
                />
              </div>

              {/* Materials Row */}
              {currentLesson.attachments && currentLesson.attachments.length > 0 && (
                <div className="bg-[#1F1F1F] rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Material de Apoio
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {currentLesson.attachments.map((attachment: any) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        className="flex items-center p-3 bg-[#2F2F2F] rounded-lg hover:bg-[#3F3F3F] transition-colors min-w-[250px] flex-1"
                      >
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {attachment.title}
                          </p>
                          <p className="text-xs text-gray-400 uppercase">
                            {attachment.type}
                          </p>
                        </div>
                        <Download className="w-5 h-5 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Completion Status */}
            {isCompleted && (
              <div className="bg-green-900/20 rounded-lg p-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-green-400">Aula concluída!</span>
              </div>
            )}

            {isSkipping && (
              <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
                Não é permitido pular partes do vídeo
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};